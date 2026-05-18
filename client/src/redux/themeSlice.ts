import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

interface ThemeState {
    theme: Theme;
    isInitialized: boolean;
}

const initialState: ThemeState = {
    theme: "light",
    isInitialized: false,
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme(state, action: PayloadAction<Theme>) {
            state.theme = action.payload;
        },
        toggleTheme(state) {
            state.theme = state.theme === "light" ? "dark" : "light";
        },
        setInitialized(state) {
            state.isInitialized = true;
        },
    },
});

export const { setTheme, toggleTheme, setInitialized } = themeSlice.actions;
export default themeSlice.reducer;
