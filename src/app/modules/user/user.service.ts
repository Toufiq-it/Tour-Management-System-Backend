import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";

// create user
const createUser = async (payload: Partial<IUser>) => {
    const { email,password, ...rest } = payload;

    const isUserExist = await User.findOne({email});

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST,"User is Already Exist")
    }

    const hashPassword = await bcryptjs.hash(password as string, 10);
    
    const authProvider: IAuthProvider = {provider: "credential", providerId: email as string}

    const user = await User.create({
        email,
        password: hashPassword,
        auth: [authProvider],
        ...rest,
    })
    return user;
};


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

export const UserService = {
    createUser,
    getAllUsers
};