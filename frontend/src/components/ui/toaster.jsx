import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-white border border-neutral-200 text-neutral-900 shadow-sm",
          title: "text-sm font-medium",
          description: "text-sm text-neutral-600",
        },
      }}
    />
  );
}
