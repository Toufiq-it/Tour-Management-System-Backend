/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";

const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

/**
 * Transaction Role Back Proccess
 * 
 * Duplicate DB Collections / replica DB / virtual DB
 * virtual DB -> [ Create Booking -> Create Payment -> Update Booking -> Error] -> Not adding Real DB
 * virtual DB -> [ Create Booking -> Create Payment -> Update Booking -> successful] -> adding Real DB
 */


const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId();
    console.log(payload);
    
    const session = await Booking.startSession();
    session.startTransaction()

    try {
        const user = await User.findById(userId);

        if (!user?.phone || !user.address) {
            throw new AppError(httpStatus.BAD_REQUEST, "Please Update your Profile to Book a Tour");
        }

        // get amount from tour fields
        const tour = await Tour.findById(payload.tour).select("costFrom");

        if (!tour?.costFrom) {
            throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found!!")
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount!);

        // Booking
        const booking = await Booking.create([{
            user: userId,
            status: BOOKING_STATUS.PENDING,
            ...payload,
        }], { session });

        // Payment
        const payment = await Payment.create([{
            booking: booking[0]._id,
            status: PAYMENT_STATUS.UNPAID,
            transactionId: transactionId,
            amount: amount,
        }], {session});

        const updatedBooking = await Booking.findByIdAndUpdate(
            booking[0]._id,
            { payment: payment[0]._id },
            { new: true, runValidators: true, session }
        )
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");

        // SSL
        const userAddress = (updatedBooking?.user as any).address
        const userEmail = (updatedBooking?.user as any).email
        const userPhoneNumber = (updatedBooking?.user as any).phone
        const userName = (updatedBooking?.user as any).name

        const sslPayload: ISSLCommerz = {
            address: userAddress,
            email: userEmail,
            name: userName,
            phoneNumber: userPhoneNumber,
            amount: amount,
            transactionId: transactionId,
        }
        const sslPayment = await SSLService.sslPaymentInit(sslPayload)
        console.log(sslPayment);
        

        // virtual DB -> Real DB
        await session.commitTransaction(); // transaction
        session.endSession();

        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking
        }

    } catch (error) {
        // virtual DB remove all process and not adding DB
        await session.abortTransaction(); // roll Back
        session.endSession();
        throw error;
    }
};

// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Complete -> Backend(localhost:5000/api/v1/payment/success) -> Update Payment(PAID) & Booking(CONFIRM) -> redirect to frontend -> Frontend(localhost:5173/payment/success)

// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Fail / Cancel -> Backend(localhost:5000) -> Update Payment(FAIL / CANCEL) & Booking(FAIL / CANCEL) -> redirect to frontend -> Frontend(localhost:5173/payment/cancel or fail)



const getUserBookings = async () => {

    return {}
};

const getBookingById = async () => {
    return {}
};

const updateBookingStatus = async (

) => {

    return {}
};

const getAllBookings = async () => {

    return {}
};

export const BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};