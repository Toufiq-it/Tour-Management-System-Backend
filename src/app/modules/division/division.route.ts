import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDivisionSchema, updateDivisionSchema } from "./division.validation";
import { DivisionController } from "./division.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

// create 
router.post("/create", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createDivisionSchema), 
    DivisionController.createDivision);

    // get all
router.get("/", DivisionController.getAllDivision);
// single
router.get("/:slug", DivisionController.getSingleDivision);
// update
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateDivisionSchema),
    DivisionController.updateDivision
);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionController.deleteDivision);

export const DivisionRoutes = router;