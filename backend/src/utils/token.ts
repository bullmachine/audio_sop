import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY =
    process.env.ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'];

const REFRESH_TOKEN_EXPIRY =
    process.env.REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'];

if (
    !ACCESS_TOKEN_SECRET ||
    !REFRESH_TOKEN_SECRET ||
    !ACCESS_TOKEN_EXPIRY ||
    !REFRESH_TOKEN_EXPIRY
) {
    throw new Error('Missing required JWT environment variables');
}

export interface JwtUserPayload {
    id: string;
    email: string;
    role?: string;
}

// Helper function to sign token with explicit SignOptions type
const signToken = (payload: object, secret: string, expiresIn: SignOptions['expiresIn']): string => {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secret, options);
};

// Generate access token
export const generateAccessToken = (payload: object): string => {
    return signToken(payload, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY);
};

// Generate refresh token
export const generateRefreshToken = (payload: object): string => {
    return signToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY);
};

// Verify access token
export const verifyAccessToken = (token: string): JwtUserPayload => {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (typeof decoded === 'string') {
        throw new Error('Invalid token payload');
    }

    return decoded as JwtUserPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtUserPayload => {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    if (typeof decoded === 'string') {
        throw new Error('Invalid token payload');
    }

    return decoded as JwtUserPayload;
};
