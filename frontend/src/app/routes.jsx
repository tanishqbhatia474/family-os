import { Routes, Route } from "react-router-dom";
import Signup from "../pages/Auth/Signup";
import Login from "../pages/Auth/Login";
import Onboarding from "../pages/Onboarding/Onboarding";
import CreateFamily from "../pages/Onboarding/CreateFamily";
import JoinFamily from "../pages/Onboarding/JoinFamily";
import Dashboard from "../pages/Dashboard";
import RootRedirect from "../pages/RootRedirect";
import { RequireAuth, RequireFamily } from "./guards";
import AppShell from "../components/layout/AppShell";
import FamilyTree from "../pages/FamilyTree";
import Documents from "../pages/Documents";
import Rituals from "../pages/Rituals";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/create"
        element={
          <RequireAuth>
            <CreateFamily />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/join"
        element={
          <RequireAuth>
            <JoinFamily />
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireFamily>
              <AppShell>
                <Dashboard />
              </AppShell>
            </RequireFamily>
          </RequireAuth>
        }
      />


      <Route
        path="/family-tree"
        element={
          <RequireAuth>
            <RequireFamily>
              <AppShell>
                <FamilyTree />
              </AppShell>
            </RequireFamily>
          </RequireAuth>
        }
      />

      <Route
        path="/documents"
        element={
          <RequireAuth>
            <RequireFamily>
              <AppShell>
                <Documents />
              </AppShell>
            </RequireFamily>
          </RequireAuth>
        }
      />

      <Route
        path="/rituals"
        element={
          <RequireAuth>
            <RequireFamily>
              <AppShell>
                <Rituals />
              </AppShell>
            </RequireFamily>
          </RequireAuth>
        }
      />

    </Routes>

      
  );
}
