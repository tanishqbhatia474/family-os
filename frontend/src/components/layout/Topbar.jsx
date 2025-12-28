import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-56 right-0 h-14 px-6
                       flex items-center justify-end z-20">
      <Button
        variant="outline"
        size="sm"
        className="
          border-neutral-300
          text-neutral-700
          bg-white/60
          hover:bg-[#1F3D34]/10
          hover:text-[#1F3D34]
          transition-colors
        "
        onClick={logout}
      >
        Logout
      </Button>

    </header>
  );
}
