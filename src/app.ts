import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/v1", router)

// Root Route
app.get("/",(req: Request, res: Response)=>{
    res.status(200).json({
        message: "Welcome to Tour Management System"
    });
});

// Global error handler
app.use(globalErrorHandler);

// not found route
app.use(notFound);

export default app;