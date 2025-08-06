/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError";
import { handleDublicateError } from "../errorHelpers/handleDublicateError";
import { handleCastError } from "../errorHelpers/handleCastError";
import { handleZodError } from "../errorHelpers/handleZodError";
import { handleValidationError } from "../errorHelpers/handleValidationError";
import { TErrorSources } from "../interfaces/error.types";


export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.log(err);
    }

    let statusCode = 500
    let message = `Something went wrong ${err.message}`

    let errorSources: TErrorSources[] = [];

    // Duplicate error
    if (err.code === 11000) {
        const simplifiedError = handleDublicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // ObjectId / cast error
    else if (err.name === "CastError") {
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Zod error
    else if (err.name === "ZodError") {
        const simplifiedError = handleZodError(err)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = simplifiedError.errorSources as TErrorSources[];
    }

    // Mongoose validation error
    else if (err.name === "ValidationError") {
        const simplifiedError = handleValidationError(err)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = simplifiedError.errorSources as TErrorSources[];
    }
    // custom error handle
    else if (err instanceof AppError) {
        statusCode = err.statueCode
        message = err.message
    } else if (err instanceof Error) {
        statusCode = 500
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        // backend dev er jonno nijer 2ta
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null,
    })
};