"use client";

import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { themes } from "@/config/themes";
import { useTheme } from "@/hooks/use-theme";

// Toasts (§7.3): slide up from the bottom, 3s, above the bottom nav. Colored by meaning (success green,
// error red, info indigo, warning amber) with the soft/fg token pairs, whose contrast the theme test
// checks in every theme. Uses our own useTheme (decision D10: no next-themes).
function Toaster(props: ToasterProps) {
  const { resolved } = useTheme();
  return (
    <Sonner
      theme={themes[resolved].scheme}
      position="bottom-center"
      duration={3000}
      offset={{ bottom: 96 }}
      mobileOffset={{ bottom: 96 }}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-card)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-sans text-[15px] font-medium shadow-toast",
          success: "bg-success-soft! text-success-fg! border-success-fg/25!",
          error: "bg-danger-soft! text-danger-fg! border-danger-fg/25!",
          info: "bg-primary-soft! text-primary-soft-fg! border-primary-soft-fg/25!",
          warning: "bg-warning-soft! text-warning-fg! border-warning-fg/25!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
