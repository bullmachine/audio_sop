import cors, { CorsOptions } from "cors";
import { CLIENT_URL } from "../config/env.config";

const allowedOrigins = [
    CLIENT_URL,
    "http://192.168.1.49",
    "http://192.168.1.49/audio_sop/",
    "http://192.168.1.49/",
    "http://localhost",
    "http://localhost/audio_sop/",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
];

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

export default cors(corsOptions);
