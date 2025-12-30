import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <header
      className="
        fixed top-0 left-56 right-0 h-14 px-6
        flex items-center justify-end gap-3
        z-20

        /* LIGHT MODE */
        bg-transparent
        border-b border-black/10

        /* DARK MODE */
        dark:bg-black/60
        dark:backdrop-blur-md
        dark:border-white/10
      "
    >
      {/* Theme toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="
          w-9 h-9
          border-neutral-300 dark:border-neutral-700
          bg-white/70 dark:bg-neutral-900/60
          text-neutral-700 dark:text-neutral-200
          hover:bg-black/5 dark:hover:bg-white/10
          transition-colors
        "
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      {/* Logout */}
      <Button
        variant="outline"
        size="sm"
        className="
          border-neutral-300 dark:border-neutral-700
          bg-white/70 dark:bg-neutral-900/60
          text-neutral-700 dark:text-neutral-200
          hover:bg-black/5 dark:hover:bg-white/10
          transition-colors
        "
        onClick={logout}
      >
        Logout
      </Button>
    </header>
  );
}
