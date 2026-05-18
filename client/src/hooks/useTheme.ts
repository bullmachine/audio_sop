"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import {
  setTheme,
  setInitialized,
  toggleTheme as toggleThemeAction,
} from "../redux/themeSlice";
import { STORAGE_KEYS } from "../services/storage";

export default function useTheme() {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, isInitialized } = useSelector(
    (state: RootState) => state.theme
  );

  // Get current theme from HTML class
  const getCurrentTheme = useCallback(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initialTheme = localStorage.getItem(STORAGE_KEYS.THEME) as "light" | "dark"   

    // Apply the theme class immediately
    const html = document.documentElement;
    if (initialTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    dispatch(setTheme(initialTheme));
    dispatch(setInitialized());
  }, [dispatch]);

  // Sync theme to localStorage and update class
  useEffect(() => {
    if (!isInitialized) return;

    const html = document.documentElement;
    const currentTheme = getCurrentTheme();

    if (theme !== currentTheme) {
      if (theme === 'dark') {
        html.classList.add('dark'); 
      } else {
        html.classList.remove('dark'); 
      }
    }

    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme, isInitialized, getCurrentTheme]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    dispatch(toggleThemeAction());
  }, [dispatch]);

  return {
    theme,
    toggleTheme,
  };
}
