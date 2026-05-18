// utils/jwt.ts
export interface JwtPayload {
    exp?: number;  
    [key: string]: any;
}

export const decodeJWT = (token: string): JwtPayload | null => {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch (err) {
        console.error('Failed to decode JWT', err);
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 < Date.now();
};
