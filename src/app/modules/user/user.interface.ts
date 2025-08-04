import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    GUIDE = "GUIDE"
}

// auth providers
/**
 * email, password
 * google auth
 */

export interface IAuthProvider {
    provider: "google" | "credential", // google, credential
    providerId: string,
};

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}

export interface IUser {
    _id?: Types.ObjectId,
    name: string,
    email: string,
    password?: string,
    phone?: string,
    picture?: string,
    address?: string,
    isDeleted?: string,
    isActive?: IsActive,
    isVarified?: boolean,
    role: Role,
    auth: IAuthProvider[],
    booking?: Types.ObjectId[],
    guides?: Types.ObjectId[],
};