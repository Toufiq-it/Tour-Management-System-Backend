/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;



const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);

        console.log("Connected to Database !!!");

        server = app.listen(5000, () => {
            console.log("Server is listening on port 5000");
        });
    } catch (error) {
        console.log(error);
    };

};

startServer();

/**
 * server ERROR handle !
 * unhandled rejection error
 * uncaught rejection error
 * signal termination sigterm
 * 
 */


// unhandled rejection error
process.on("unhandledRejection", (err) => {
    console.log("unhandled Rejection detected... server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// Promise.reject(new Error("I forgot to catch this error"));


// uncaught rejection error
process.on("uncaughtException", (err) => {
    console.log("uncaught Exception detected... server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

// throw new Error("i forgot to handle this local error");

// signal termination sigterm -> Cloud platfrom theke cloud er owner/company-owner jodi server off kore tahole ei error massage dibe, ete kore buja jabe k server off korlo
process.on("SIGTERM", () => {
    console.log("SIGTERM signal recevied... server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});


// manually server off korle ei error handle er massage dibe
process.on("SIGINT", () => {
    console.log("SIGINT signal recevied... server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});




