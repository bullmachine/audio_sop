import multer from "multer";
import path from "path";
import fs from "fs";
import { AUDIO_UPLOAD_DIR } from "../config/paths.config";

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const audioStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        ensureDir(AUDIO_UPLOAD_DIR);
        cb(null, AUDIO_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `audio-${uniqueSuffix}${ext}`);
    },
});

const AUDIO_MIME_TYPES = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/webm",
    "audio/aac",
    "audio/mp4",
    "audio/x-m4a",
];

export const audioUpload = multer({
    storage: audioStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = [".mp3", ".wav", ".ogg", ".webm", ".aac", ".m4a", ".mp4"];

        if (AUDIO_MIME_TYPES.includes(file.mimetype) || allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed (mp3, wav, ogg, webm, aac, m4a)"));
        }
    },
});
