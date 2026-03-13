"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark", toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gjq_theme") as Theme | null;
    const t = stored || "dark";
    setTheme(t);
    apply(t);
    setMounted(true);
  }, []);

  const apply = (t: Theme) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("gjq_theme", next);
    apply(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {!mounted && (
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t=localStorage.getItem('gjq_theme')||'dark';
            if(t==='dark'){document.documentElement.classList.add('dark');}
            else{document.documentElement.classList.remove('dark');}
          })();
        `}} />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
