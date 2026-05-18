import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "../store/store";
import { login, logout } from "../redux/authSlice";
import type { AuthResponse } from "../types/auth";

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);

    const loginUser = (userData: AuthResponse) => {
        dispatch(login(userData)); // Dispatch full user data (user object)
    };

    const logoutUser = () => {
        dispatch(logout());
    };

    return {
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        login: loginUser,
        logout: logoutUser,
    };
};
