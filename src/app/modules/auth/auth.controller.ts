/* eslint-disable @typescript-eslint/no-explicit-any */
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
import passport from "passport";

// passport credential login
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body);

    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {
            // eigulo use kora jabe nh
            // throw new AppError(401, "some error")
            // next(err)
            // return new AppError(401, err);

            // use kore jbe
            // return next(err);
            return next(new AppError(401, err));
        }

        if (!user) {
            return next(new AppError(401, info.message));
        }

        const userToken = await createUsertoken(user);

        // remove password // security optimization -> frontend and backend don't show password, that's why remove password
        // delete user.toObject().password
        const { password: pass, ...rest} = user.toObject();

        // set cookies in browser
        setAuthCookie(res, userToken);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest,
            },
        });

    })(req, res, next)

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
    if (envVars.NODE_ENV === "development") {
        console.log("user", user);
    }


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