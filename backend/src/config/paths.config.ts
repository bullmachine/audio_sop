import path from "path";

/** Project uploads directory (works for both src/ and dist/ runtime). */
export const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");
export const AUDIO_UPLOAD_DIR = path.join(UPLOADS_ROOT, "audio");
