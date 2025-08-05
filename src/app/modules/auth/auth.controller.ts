/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../ulits/catchAsync";
import sendResponse from "../../ulits/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../ulits/setCookie";
import { createUsertoken } from "../../ulits/userTokens";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// custom login
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    // set cookies in browser
    // res.cookie("accessToken", loginInfo.accessToken, {
    //     // frontend e cookies ta set korbe
    //     httpOnly: true,
    //     secure: false,
    // });

    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false,
    // })

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        data: loginInfo,
    });
});

// refresh token
const getNewAccesstoken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false,
    // });

    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo,
    });
});

// logout
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged out Successfully",
        data: null,
    });
});

// reset password
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedTokan = req.user;

    await AuthServices.resetPassword(oldPassword, newPassword, decodedTokan as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    });
});

// google callback
const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    let redirectTo = req.query.state ? req.query.state as string : "";

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

    // /booking = /booking, => "/" = ""

    const user = req.user;
    console.log("user", user);
    

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    const tokenInfo = createUsertoken(user);

    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: "Password Changed Successfully",
    //     data: null,
    // });

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
});


export const AuthControllers = {
    credentialsLogin,
    getNewAccesstoken,
    logout,
    resetPassword,
    googleCallbackController,
}