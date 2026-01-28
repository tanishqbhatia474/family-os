import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-white border border-neutral-200 text-neutral-900 shadow-sm text-sm sm:text-base",
          title: "text-xs sm:text-sm font-medium",
          description: "text-xs sm:text-sm text-neutral-600",
          actionButton: "text-xs sm:text-sm",
          cancelButton: "text-xs sm:text-sm",
        },
      }}
      // Mobile-specific settings
      style={{
        // Adjust toast width on mobile
        "--width": "calc(100vw - 2rem)",
        "--mobile-offset": "1rem",
      }}
      // Ensure toasts don't overflow on mobile
      richColors
      closeButton
      expand={false}
      // Stack toasts vertically with smaller gap on mobile
      gap={8}
      // Reduce toast height on mobile for better stacking
      visibleToasts={3}
    />
  );
}