import { cn } from "@/lib/utils";

export const Separator = ({ orientation = "vertical", className, ...props }) => {
  return (
    <div
      role="separator"
      className={cn(
        "magic-dock-separator",
        orientation === "vertical" ? "separator-vertical" : "separator-horizontal",
        className
      )}
      {...props}
    />
  );
};

export default Separator;
