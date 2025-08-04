/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserService } from "./user.service";
import { catchAsync } from "../../ulits/catchAsync";
import sendResponse from "../../ulits/sendResponse";
import { verifyToke } from "../../ulits/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


// create user
// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const user = await UserService.createUser(req.body);
//         res.status(httpStatus.CREATED).json({
//             message: "User Created Successfully",
//             user
//         })
//     } catch (err: any) {
//         console.log(err);
//         next(err);
//     }
// };

// create user
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);

    // res.status(httpStatus.CREATED).json({
    //     message: "User Created Successfully",
    //     user
    // });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: user,
    });
});


// update user
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;

    
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToke(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload;
    const verifiedToken = req.user;

    const user = await UserService.updateUser(userId, payload, verifiedToken);

    // res.status(httpStatus.CREATED).json({
    //     message: "User Created Successfully",
    //     user
    // });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user,
    });
});


// Get All users
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserService.getAllUsers();

    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Users Retrieved Successfully",
        data: users.data,
        meta: users.meta
    });
});


export const userController = {
    createUser,
    getAllUsers,
    updateUser,
};

// route matching -> controller -> service -> model -> DB