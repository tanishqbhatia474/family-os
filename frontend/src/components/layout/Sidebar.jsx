import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [isDark, setIsDark] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      // fallback to system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      setIsDark(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);

    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <aside
      className="
        fixed left-0 top-0 h-screen w-64 z-30
        bg-gradient-to-b from-[#0d3025] to-[#0a2a20]
        backdrop-blur-xl
        border-r border-white/5
        shadow-2xl
      "
    >
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      <div className="relative h-full flex flex-col px-6 py-8">
        {/* Brand */}
        <div className="mb-12 flex items-center gap-3">
          <img
            src="/illustrations/ContinuumLight.png"
            className="illustration light-only w-6 h-6 opacity-80"
            alt="Continuum"
            draggable={false}
          />
          <img
            src="/illustrations/ContinuumLight.png"
            className="illustration dark-only w-6 h-6 opacity-80"
            alt="Continuum"
            draggable={false}
          />

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Family OS
            </h1>
            <p className="text-xs text-white/50 font-medium">
              Your family's story
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1">
          {[
            { label: "Dashboard", path: "/dashboard", icon: "◦" },
            { label: "Family Tree", path: "/family-tree", icon: "⟡" },
            { label: "Documents", path: "/documents", icon: "≋" },
            { label: "Rituals", path: "/rituals", icon: "◌" },
          ].map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-3 rounded-xl
                 text-sm font-medium transition-all duration-200
                 ${
                   isActive
                     ? "bg-white/10 text-white shadow-lg shadow-black/20"
                     : "text-white/60 hover:text-white hover:bg-white/5"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated border glow on active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7fb9a5]/20 to-transparent opacity-50" />
                  )}

                  {/* Icon */}
                  <span
                    className={`
                      relative text-base transition-all duration-200
                      ${isActive ? "text-[#a8d5c2] scale-110" : "text-white/40 group-hover:text-white/60"}
                    `}
                  >
                    {icon}
                  </span>

                  {/* Label */}
                  <span className="relative">{label}</span>

                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#a8d5c2] rounded-l-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="pt-6 border-t border-white/5 space-y-2">
          <NavLink
            to="/about"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
          >
            <span className="text-xs">?</span>
            <span>About</span>
          </NavLink>

          {/* Logout */}
          <button
            onClick={logout}
            className="
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              text-sm font-medium
              text-red-400/80
              hover:text-red-400
              hover:bg-red-500/10
              transition-all duration-200
            "
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}