import { Link } from "react-router-dom";

export default function Onboarding() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6 border rounded-lg">
        <h1 className="text-2xl font-semibold text-center">
          Welcome to Rituals World
        </h1>

        <p className="text-sm text-muted-foreground text-center">
          Create a new family or join an existing one.
        </p>

        <div className="space-y-4">
          <Link
            to="/onboarding/create"
            className="block w-full text-center border rounded py-2"
          >
            Create Family
          </Link>

          <Link
            to="/onboarding/join"
            className="block w-full text-center border rounded py-2"
          >
            Join Family
          </Link>
        </div>
      </div>
    </div>
  );
}
