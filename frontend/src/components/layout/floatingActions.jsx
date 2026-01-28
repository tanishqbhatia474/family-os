import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function FloatingActions({ onOpenSidebar }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="fixed top-4 inset-x-0 z-30 flex justify-between px-4 md:px-6 pointer-events-none">
      
      {/* LEFT: Hamburger (mobile only) */}
      <div className="pointer-events-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSidebar}
          className="
            md:hidden
            bg-white/80 text-neutral-800
            border border-black/10
            hover:bg-white
            dark:bg-neutral-900/80
            dark:text-neutral-100
            dark:border-white/10
            dark:hover:bg-neutral-900
          "
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* RIGHT: Theme toggle */}
      <div className="pointer-events-auto flex gap-2">
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
      </div>
    </div>
  );
}