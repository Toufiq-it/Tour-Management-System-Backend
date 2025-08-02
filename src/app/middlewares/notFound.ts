import { Request, Response } from "express";
import httpStatus from "http-status-codes";

const notFound = (req: Request, res: Response)=>{
    res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Not Found Route"
    });
};

export default notFound;