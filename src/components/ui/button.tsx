import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/cn";

// Sizes and shapes follow the approved screens (docs/design): 44px pills, 56px full-width primary,
// 40px outline chips, 44px round icon buttons. Primary = "tap here" (indigo) only.
const buttonVariants = cva(
  "inline-flex shrink-0 press items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary bg-grad-action text-primary-foreground hover:brightness-110",
        soft: "bg-primary-soft text-primary-soft-fg hover:bg-primary-soft/80",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-danger-soft text-danger-fg hover:bg-danger-soft/80",
        link: "text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 rounded-full px-4 text-[15px]",
        sm: "h-10 rounded-full px-3.5 text-sm font-medium",
        lg: "h-14 w-full rounded-button px-5 text-[17px]",
        icon: "size-11 rounded-full",
        "icon-sm": "size-9 rounded-full [&_svg:not([class*='size-'])]:size-4",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto rounded-none px-0" }],
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
