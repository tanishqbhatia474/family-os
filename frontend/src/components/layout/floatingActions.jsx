import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function FloatingActions() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="fixed top-4 right-6 z-30 flex gap-2">
      {/* Theme toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="
          bg-white/80 text-neutral-800
          border border-black/10
          hover:bg-white
          dark:bg-neutral-900/80
          dark:text-neutral-100
          dark:border-white/10
          dark:hover:bg-neutral-900
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
        size="icon"
        onClick={logout}
        className="
          bg-white/80 text-neutral-800
          border border-black/10
          hover:bg-white
          dark:bg-neutral-900/80
          dark:text-neutral-100
          dark:border-white/10
          dark:hover:bg-neutral-900
        "
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
