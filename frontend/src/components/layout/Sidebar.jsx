import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItem =
    "block text-sm py-2 transition-colors relative pl-4";

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 px-6 pt-10 z-30
                 bg-[#114334]/85 text-white"
      style={{
        boxShadow: "4px 0 14px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Brand */}
      <div className="text-sm font-medium tracking-tight mb-8 text-white/90">
        Family OS
      </div>

      <nav className="space-y-2">
        {[
          ["Dashboard", "/dashboard"],
          ["Family Tree", "/family-tree"],
          ["Documents", "/documents"],
          ["Rituals", "/rituals"],
        ].map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[2px] before:bg-[#A8D5C2]"
                  : "text-white/70 hover:text-white"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
