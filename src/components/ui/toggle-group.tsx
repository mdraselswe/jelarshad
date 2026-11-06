"use client";

import { type VariantProps } from "class-variance-authority";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import * as React from "react";

import { toggleVariants } from "@/components/ui/toggle-variants";
import { cn } from "@/lib/cn";

type Variant = NonNullable<VariantProps<typeof toggleVariants>["variant"]>;

const ToggleGroupContext = React.createContext<{ variant: Variant }>({ variant: "chip" });

function ToggleGroup({
  className,
  variant = "chip",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & { variant?: Variant }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      className={cn(
        variant === "segmented"
          ? "flex h-14 w-full items-center gap-1 rounded-input bg-muted p-1"
          : "flex flex-wrap items-center gap-2",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext value={{ variant }}>{children}</ToggleGroupContext>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const { variant } = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants({ variant }), className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
