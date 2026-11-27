import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = ({ children }) => <>{children}</>;

export const Tooltip = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="magic-tooltip-container"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        if (child.type === TooltipTrigger) {
          return React.cloneElement(child);
        }
        if (child.type === TooltipContent) {
          return open ? React.cloneElement(child) : null;
        }
        return child;
      })}
    </div>
  );
};

export const TooltipTrigger = ({ asChild, children, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <button type="button" {...props}>{children}</button>;
};

export const TooltipContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("magic-tooltip-content", className)} {...props}>
      {children}
    </div>
  );
};
