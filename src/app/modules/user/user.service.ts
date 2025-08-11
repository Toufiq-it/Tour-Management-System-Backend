import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// create user
const createUser = async (payload: Partial<IUser>) => {
    const { email,password, ...rest } = payload;

    const isUserExist = await User.findOne({email});

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST,"User is Already Exist")
    }

    const hashPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));
    
    const authProvider: IAuthProvider = {provider: "credential", providerId: email as string}

    const user = await User.create({
        email,
        password: hashPassword,
        auth: [authProvider],
        ...rest,
    })
    return user;
};

// update user
const updateUser = async ( userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const ifUserIdExist = await User.findById(userId);

    if (!ifUserIdExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    /**
     * email - can not update
     * name, phone, password, address
     * password re hashing
     * only admin, super admin - role, isDeleted
     * 
     * promoting superAdmin -superAdmin
     */

    // Role update
    if (payload.role) {
        // user ba guide hole ei error
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }

        // jodi kono admin nijeke ba jakono user k superAdmin korte cay tahole ei error dibe
        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }
    
    // user, guide jodi isActive, isDeleted, isVarified update korte cay
    if (payload.isActive || payload.isDeleted || payload.isVarified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    // password hashing
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators:  true});
    return newUpdateUser;
}

// get All users
const getAllUsers = async () => {
    const users = await User.find({});

    const totalUser = await User.countDocuments();

    return {
        data: users,
        meta: {
            total: totalUser,
        }
    };
}

// Get single user
const getSingleUser = async (slug: string) => {
    const user = await User.find({slug});

    return {
        data: user
    };
}

export const UserService = {
    createUser,
    updateUser,
    getAllUsers,
    getSingleUser,
};