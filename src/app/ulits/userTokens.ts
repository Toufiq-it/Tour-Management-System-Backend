import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToke } from "./jwt";
import httpStatus from 'http-status-codes';
import AppError from "../errorHelpers/AppError";


export const createUsertoken = (user: Partial<IUser>) => {
    const jwtPayload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        }
    
        const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
        
        // refresh token
        const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES);

        return {
            accessToken,
            refreshToken,
        }
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string)=>{

    const verifiedRefreshToken = verifyToke(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload

    //email check
    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

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

    // jwt token
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
    return accessToken;

}