import { userController } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { Router } from "express";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), userController.createUser);
router.get("/all-users", userController.getAllUsers);

export const UserRoutes = router;