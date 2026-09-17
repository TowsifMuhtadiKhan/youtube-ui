import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ColorMode = "light" | "dark";

interface ThemeContextType {
    colorMode: ColorMode;
    toggleColorMode: () => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    colorMode: "dark",
    toggleColorMode: () => { },
    primaryColor: "#e47764",
    setPrimaryColor: () => { },
});

export const useThemeMode = () => useContext(ThemeContext);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [colorMode, setColorMode] = useState<ColorMode>(() => {
        const stored = localStorage.getItem("tomtube-theme");
        return stored === 'light' ? 'light' : 'dark';
    });

    const [accentColor, setPrimaryColor] = useState<string>(() => {
        return localStorage.getItem("littleloop-palette-accent") || "";
    });
    const primaryColor = accentColor || (colorMode === 'dark' ? '#e47764' : '#bb2d40');

    useEffect(() => {
        localStorage.setItem("tomtube-theme", colorMode);
        if (accentColor) localStorage.setItem("littleloop-palette-accent", accentColor);

        // Update CSS root vars
        const root = document.documentElement;
        root.style.setProperty("--primary-color", primaryColor);
        
        if (colorMode === "dark") {
            root.style.setProperty("--bg-primary", "#0b132b");
            root.style.setProperty("--bg-secondary", "#10192f");
            root.style.setProperty("--bg-card", "#131d36");
            root.style.setProperty("--bg-card-hover", "#1c2841");
            root.style.setProperty("--bg-surface", "#18233b");
            root.style.setProperty("--text-primary", "#f1f1f1");
            root.style.setProperty("--text-secondary", "#aaaaaa");
            root.style.setProperty("--text-muted", "#717171");
            root.style.setProperty("--border-subtle", "#2b344b");
            root.style.setProperty("--border-medium", "#3d465d");
        } else {
            root.style.setProperty("--bg-primary", "#ffffff");
            root.style.setProperty("--bg-secondary", "#fff8f6");
            root.style.setProperty("--bg-card", "#f0f0f0");
            root.style.setProperty("--bg-card-hover", "#e8e8e8");
            root.style.setProperty("--bg-surface", "#eeeeee");
            root.style.setProperty("--text-primary", "#0b132b");
            root.style.setProperty("--text-secondary", "#606060");
            root.style.setProperty("--text-muted", "#909090");
            root.style.setProperty("--border-subtle", "#e0e0e0");
            root.style.setProperty("--border-medium", "#cccccc");
        }
    }, [colorMode, primaryColor, accentColor]);

    const toggleColorMode = () => {
        setColorMode((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: colorMode,
                    primary: { main: primaryColor, contrastText: primaryColor === '#e47764' ? '#0b132b' : '#ffffff' },
                    secondary: { main: '#842442' },
                    background: {
                        default: colorMode === "dark" ? "#0b132b" : "#ffffff",
                        paper: colorMode === "dark" ? "#131d36" : "#fff8f6",
                    },
                    text: {
                        primary: colorMode === "dark" ? "#f1f1f1" : "#0b132b",
                        secondary: colorMode === "dark" ? "#aaaaaa" : "#606060",
                    },
                    divider: colorMode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                },
                typography: {
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    allVariants: {
                        color: colorMode === "dark" ? "#f1f1f1" : "#0b132b",
                        fontSize: "14px",
                    },
                },
                shape: { borderRadius: 8 },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                backgroundColor: colorMode === "dark" ? "#0b132b" : "#ffffff",
                                color: colorMode === "dark" ? "#f1f1f1" : "#0b132b",
                                scrollbarWidth: "thin",
                                scrollbarColor: colorMode === "dark" ? "#3d465d transparent" : "#ccc transparent",
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
                            indicator: { backgroundColor: colorMode === "dark" ? "#f1f1f1" : "#0b132b" },
                        },
                    },
                    MuiTab: {
                        styleOverrides: {
                            root: {
                                color: colorMode === "dark" ? "#888" : "#606060",
                                textTransform: "none",
                                fontFamily: "'Inter', sans-serif",
                                "&.Mui-selected": {
                                    color: colorMode === "dark" ? "#f1f1f1" : "#0b132b",
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
        [colorMode, primaryColor]
    );

    return (
        <ThemeContext.Provider value={{ colorMode, toggleColorMode, primaryColor, setPrimaryColor }}>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
