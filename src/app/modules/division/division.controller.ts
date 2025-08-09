/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../ulits/catchAsync";
import { DivisionService } from "./division.service";
import sendResponse from "../../ulits/sendResponse";
import httpStatus from "http-status-codes";

// create division
const createDivision = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const division = await DivisionService.createDivision(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Division Creade SuccessFully",
        data: division,
    });
});

// get all division
const getAllDivision = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const divisions = await DivisionService.getAllDivision();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Division Retrieved SuccessFully",
        data: divisions.data,
        meta: divisions.meta,
    });
});

// single division
const getSingleDivision = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug
    const result = await DivisionService.getSingleDivision(slug);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Divisions retrieved",
        data: result.data,
    });
});

// update division
const updateDivision = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await DivisionService.updateDivision(id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division updated",
        data: result,
    });
});

// delete division
const deleteDivision = catchAsync(async (req: Request, res: Response) => {
    const result = await DivisionService.deleteDivision(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division deleted",
        data: result,
    });
});

export const DivisionController = {
    createDivision,
    getAllDivision,
    getSingleDivision,
    updateDivision,
    deleteDivision,
}