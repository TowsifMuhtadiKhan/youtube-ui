import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ColorMode = "light" | "dark";

interface ThemeContextType {
    colorMode: ColorMode;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    colorMode: "dark",
    toggleColorMode: () => { },
});

export const useThemeMode = () => useContext(ThemeContext);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [colorMode, setColorMode] = useState<ColorMode>(() => {
        const stored = localStorage.getItem("tomtube-theme");
        return (stored as ColorMode) || "dark";
    });

    useEffect(() => {
        localStorage.setItem("tomtube-theme", colorMode);
        // Update CSS root vars
        const root = document.documentElement;
        if (colorMode === "dark") {
            root.style.setProperty("--bg-primary", "#0f0f0f");
            root.style.setProperty("--bg-secondary", "#161616");
            root.style.setProperty("--bg-card", "#1a1a1a");
            root.style.setProperty("--bg-card-hover", "#222222");
            root.style.setProperty("--bg-surface", "#212121");
            root.style.setProperty("--text-primary", "#f1f1f1");
            root.style.setProperty("--text-secondary", "#aaaaaa");
            root.style.setProperty("--text-muted", "#717171");
            root.style.setProperty("--border-subtle", "#2d2d2d");
            root.style.setProperty("--border-medium", "#3f3f3f");
        } else {
            root.style.setProperty("--bg-primary", "#ffffff");
            root.style.setProperty("--bg-secondary", "#f8f8f8");
            root.style.setProperty("--bg-card", "#f0f0f0");
            root.style.setProperty("--bg-card-hover", "#e8e8e8");
            root.style.setProperty("--bg-surface", "#eeeeee");
            root.style.setProperty("--text-primary", "#0f0f0f");
            root.style.setProperty("--text-secondary", "#606060");
            root.style.setProperty("--text-muted", "#909090");
            root.style.setProperty("--border-subtle", "#e0e0e0");
            root.style.setProperty("--border-medium", "#cccccc");
        }
    }, [colorMode]);

    const toggleColorMode = () => {
        setColorMode((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: colorMode,
                    primary: { main: "#ff0000" },
                    background: {
                        default: colorMode === "dark" ? "#0f0f0f" : "#ffffff",
                        paper: colorMode === "dark" ? "#1a1a1a" : "#f8f8f8",
                    },
                    text: {
                        primary: colorMode === "dark" ? "#f1f1f1" : "#0f0f0f",
                        secondary: colorMode === "dark" ? "#aaaaaa" : "#606060",
                    },
                    divider: colorMode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                },
                typography: {
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    allVariants: {
                        color: colorMode === "dark" ? "#f1f1f1" : "#0f0f0f",
                        fontSize: "14px",
                    },
                },
                shape: { borderRadius: 8 },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                backgroundColor: colorMode === "dark" ? "#0f0f0f" : "#ffffff",
                                color: colorMode === "dark" ? "#f1f1f1" : "#0f0f0f",
                                scrollbarWidth: "thin",
                                scrollbarColor: colorMode === "dark" ? "#3f3f3f transparent" : "#ccc transparent",
                            },
                        },
                    },
                    MuiDivider: {
                        styleOverrides: {
                            root: {
                                borderColor: colorMode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                            },
                        },
                    },
                    MuiTabs: {
                        styleOverrides: {
                            root: { backgroundColor: "transparent" },
                            indicator: { backgroundColor: colorMode === "dark" ? "#f1f1f1" : "#0f0f0f" },
                        },
                    },
                    MuiTab: {
                        styleOverrides: {
                            root: {
                                color: colorMode === "dark" ? "#888" : "#606060",
                                textTransform: "none",
                                fontFamily: "'Inter', sans-serif",
                                "&.Mui-selected": {
                                    color: colorMode === "dark" ? "#f1f1f1" : "#0f0f0f",
                                },
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: "none",
                            },
                        },
                    },
                },
            }),
        [colorMode]
    );

    return (
        <ThemeContext.Provider value={{ colorMode, toggleColorMode }}>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
