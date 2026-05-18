import { configureStore } from "@reduxjs/toolkit"; 
import authReducer from "../redux/authSlice";
import sidebarReducer from "../redux/sidebarSlice";
import themeReducer from "../redux/themeSlice";
import loaderReducer from "../redux/loaderSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        sidebar: sidebarReducer,
        theme: themeReducer,
        loader: loaderReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
