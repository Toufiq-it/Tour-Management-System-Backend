/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";

import { createNewAccessTokenWithRefreshToken, createUsertoken } from "../../ulits/userTokens";
import { JwtPayload } from "jsonwebtoken";
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
    // const jwtPayload = {
    //     userId: isUserExist._id,
    //     email: isUserExist.email,
    //     role: isUserExist.role,
    // }

    // const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
    // const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES);

    const userTokens = createUsertoken(isUserExist);

    // security optimization -> frontend and backend don't show password, that's why remove password

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest} = isUserExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    };
};

// access token
const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)
    return {
        accessToken : newAccessToken,
    };
};

// reset password
const resetPassword = async (oldPassword: string, newPassword: string, decodedTokan: JwtPayload) => {

    const user = await User.findById(decodedTokan.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);

    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password dose not match");
    }

    // new password hashed and set new password
    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));

    user!.save();
};

// user -> login -> token(user identity means _id, email, role etc) -> booking / payment / payment cancel -> token ->

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
}