import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../../ulits/jwt";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    //email check
    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email dose not Exist")
    }

    // password check
    const isPasswordMatch = await bcryptjs.compare(password as string, isUserExist.password as string);

    if (!isPasswordMatch) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    };

    // jwt token
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

    return {
        accessToken,
    };
}

// user -> login -> token(user identity means _id, email, role etc) -> booking / payment / payment cancel -> token ->

export const AuthServices = {
    credentialsLogin,
}