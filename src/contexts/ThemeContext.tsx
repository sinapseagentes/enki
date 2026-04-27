import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextData {
  theme: Theme;
  toggleTheme: () => void;
  scribeMode: boolean;
  toggleScribeMode: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("@Enki:theme");
    return (saved as Theme) || "light";
  });

  const [scribeMode, setScribeMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("@Enki:scribeMode");
    return saved === "true";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("@Enki:theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("@Enki:scribeMode", String(scribeMode));
  }, [scribeMode]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const toggleScribeMode = () => {
    setScribeMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, scribeMode, toggleScribeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
