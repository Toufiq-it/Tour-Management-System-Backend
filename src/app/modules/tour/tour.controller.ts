import { Request, Response } from "express";
import { catchAsync } from "../../ulits/catchAsync";
import sendResponse from "../../ulits/sendResponse";
import { TourService } from "./tour.service";

/**---------------Tour-------------*/

const createTour = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.createTour(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Tour created successfully',
        data: result,
    });
});

const getAllTours = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await TourService.getAllTours(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tours retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getSingleTour = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await TourService.getSingleTour(slug);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tours retrieved successfully',
        data: result.data,
    });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {

    const result = await TourService.updateTour(req.params.id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour updated successfully',
        data: result,
    });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TourService.deleteTour(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour deleted successfully',
        data: result,
    });
});

/**---------------Tour Type-------------*/

const getAllTourTypes = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.getAllTourTypes();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour types retrieved successfully',
        data: result,
    });
});

const createTourType = catchAsync(async (req: Request, res: Response) => {
    const body = req.body;
    const result = await TourService.createTourType(body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Tour type created successfully',
        data: result,
    });
});

const getSingleTourTypes = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await TourService.getSingleTourTypes(slug);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour types retrieved successfully',
        data: result,
    });
});

const updateTourType = catchAsync(async (req: Request, res: Response) => {
    const id  = req.params.id;
    const name  = req.body;
    const result = await TourService.updateTourType(id, name);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour type updated successfully',
        data: result,
    });
});

const deleteTourType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TourService.deleteTourType(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour type deleted successfully',
        data: result,
    });
});

export const TourController = {
    // Tour Type
    createTourType,
    getAllTourTypes,
    getSingleTourTypes,
    deleteTourType,
    updateTourType,
    // Tour 
    createTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour,
};