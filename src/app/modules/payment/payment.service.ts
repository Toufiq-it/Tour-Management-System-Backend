/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from 'http-status-codes';


const initPayment = async (bookingId: string) => {
    const payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found, You have not booked this Tour");
    }

    const bookling = await Booking.findById(payment.booking);

    // SSL
    const userAddress = (bookling?.user as any).address
    const userEmail = (bookling?.user as any).email
    const userPhoneNumber = (bookling?.user as any).phone
    const userName = (bookling?.user as any).name

    const sslPayload: ISSLCommerz = {
        address: userAddress,
        email: userEmail,
        name: userName,
        phoneNumber: userPhoneNumber,
        amount: payment.amount,
        transactionId: payment.transactionId,
    }
    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    return {
        paymentUrl: sslPayment.GatewayPageURL,
    }
};

const successPayment = async (query: Record<string, string>) => {

    // Update Booking Status to Confirm 
    // Update Payment Status to PAID

    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID,
        }, { runValidators: true, session });

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.COMPLETED },
            { runValidators: true, session }
        )


        // virtual DB -> Real DB
        await session.commitTransaction(); // transaction
        session.endSession();

        return { success: true, message: "Payment Completed Successfully" }

    } catch (error) {
        // virtual DB remove all process and not adding DB
        await session.abortTransaction(); // roll Back
        session.endSession();
        throw error;
    }
};

const failPayment = async (query: Record<string, string>) => {

    // Update Booking Status to Fail 
    // Update Payment Status to Fail

    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.FAILED,
        }, { runValidators: true, session });

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.FAILED },
            { runValidators: true, session }
        )

        // virtual DB -> Real DB
        await session.commitTransaction(); // transaction
        session.endSession();

        return { success: false, message: "Payment Failed" }

    } catch (error) {
        // virtual DB remove all process and not adding DB
        await session.abortTransaction(); // roll Back
        session.endSession();
        throw error;
    }
};

const cancelPayment = async (query: Record<string, string>) => {

    // Update Booking Status to Cancel 
    // Update Payment Status to cancel

    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.CANCELLED,
        }, { runValidators: true, session });

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.CANCEL },
            { runValidators: true, session }
        )

        // virtual DB -> Real DB
        await session.commitTransaction(); // transaction
        session.endSession();

        return { success: false, message: "Payment Cancelled" }

    } catch (error) {
        // virtual DB remove all process and not adding DB
        await session.abortTransaction(); // roll Back
        session.endSession();
        throw error;
    }
}

export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
}