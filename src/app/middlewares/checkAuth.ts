import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToke } from "../ulits/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from 'http-status-codes';
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;

        // jwt token check
        if (!accessToken) {
            throw new AppError(403, "No token Recevied");
        }

        // jwt token verified
        const verifiedToke = verifyToke(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

        //email check
        const isUserExist = await User.findOne({ email: verifiedToke.email });

        // user validetion
        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User dose not Exist")
        }

        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }

        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        // user role check
        if (!authRoles.includes(verifiedToke.role)) {
            throw new AppError(httpStatus.BAD_REQUEST, "You are not permitted to view this route!!");
        }

        req.user = verifiedToke;
        next();

    } catch (error) {
        console.log("jwt error", error);
        next(error);
    }
}