import server from "./socket";
import { connectDB } from "./config/db.config";
import { MONGO_URI, PORT, HOST } from "./config/env.config";
import { logError, logInfo } from "./utils/logger";
import { Request, Response, NextFunction } from "express";
import app from "./app";

connectDB(MONGO_URI).then(() => {
    server.listen(PORT, () => {
        console.log("Mongoose DB URL:", MONGO_URI);
        console.log(`⚡️ Server running at http://${HOST}:${PORT}`);
        console.log(`🔌 Socket.IO server running on same server`);
    });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logError(`Unhandled error in route: ${err.message}`);
    res.status(500).send('Something went wrong!');
});

// Global process-level error handling
process.on('uncaughtException', (error) => {
    logError(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});
