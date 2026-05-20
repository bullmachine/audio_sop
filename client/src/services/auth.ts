import { apiRequest } from './axios';
import type { User, AuthResponse } from '../types/auth';
import { STORAGE_KEYS, APP_BASE_URL } from './storage';

const authService = {
    async login(operator_id: string, password: string, employee_code: string, dob: string): Promise<AuthResponse> {
        try {
            const response = await apiRequest.post<AuthResponse>('/auth/login', { operator_id, password, employee_code, dob });

            if (response.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(data: { name: string, empCode: string, email: string, mobile: string, password: string, plant?: string }): Promise<AuthResponse> {
        try {
            const { name, empCode, email, mobile, password, plant } = data;

            const response = await apiRequest.post<AuthResponse>('/auth/register', { name, empCode, email, mobile, password, plant });

            if (response.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async logout(): Promise<void> {
        try {
            // await apiRequest({
            //     url: '/auth/logout',
            //     method: 'POST',
            // });
            await apiRequest.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            // Redirect to login page
            window.location.href = `${APP_BASE_URL}login`;
            // window.location.href = `${process.env.PUBLIC_URL}`;
        }
    },

    async getCurrentUser(): Promise<User> {
        try {
            // const user = await apiRequest<User>({
            //     url: '/auth/me',
            //     method: 'GET',
            // });
            const user = await apiRequest.get<User>('/auth/me');
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    hasPermission(permission: string): boolean {
        try {
            const userStr = localStorage.getItem(STORAGE_KEYS.USER);
            if (!userStr) return false;

            const user = JSON.parse(userStr) as User;

            const permissions = user.role?.permissions || [];
            return permissions.includes(permission) || permissions.includes('*');
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    },
    
    async updateProfile(profileData: { name?: string; email?: string; mobile?: string; plant?: string; currentPassword?: string; newPassword?: string; confirmPassword?: string }): Promise<any> {
        try {
            const response = await apiRequest.put('/auth/update-profile', profileData);
            return response;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    },

    async getCurrentUserProfile(): Promise<any> {
        try {
            const response = await apiRequest.get('/auth/profile');
            return response;
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    },
};

export default authService;
