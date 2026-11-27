import { cn } from "@/lib/utils";

export function buttonVariants({ variant = "default", size = "default", className = "" } = {}) {
  const base = "dock-btn";
  const variants = {
    ghost: "dock-btn-ghost",
    default: "dock-btn-default",
  };
  const sizes = {
    icon: "dock-btn-icon",
    default: "dock-btn-default-size",
  };
  return cn(base, variants[variant] || "", sizes[size] || "", className);
}
