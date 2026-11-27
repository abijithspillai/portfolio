import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const InteractiveHoverButton = React.forwardRef(
  (
    {
      text,
      children,
      className,
      to,
      href,
      download,
      target,
      rel,
      onClick,
      variant = "default", // "default" | "outline"
      arrow = true,
      ...props
    },
    ref
  ) => {
    const buttonText = text || children || "Button";

    const content = (
      <>
        {/* Default resting state: Accent dot + Initial text */}
        <span className="interactive-btn-content">
          <span className="interactive-btn-dot" />
          <span className="interactive-btn-text-initial">{buttonText}</span>
        </span>

        {/* Hover animated state: Slide in text + arrow overlay */}
        <span className="interactive-btn-hover-overlay">
          <span>{buttonText}</span>
          {arrow && <ArrowRight className="interactive-btn-arrow" />}
        </span>
      </>
    );

    const commonClasses = cn(
      "interactive-hover-btn",
      variant === "outline" ? "interactive-hover-btn-outline" : "interactive-hover-btn-primary",
      className
    );

    if (to) {
      return (
        <Link
          ref={ref}
          to={to}
          className={commonClasses}
          onClick={onClick}
          {...props}
        >
          {content}
        </Link>
      );
    }

    if (href) {
      return (
        <a
          ref={ref}
          href={href}
          download={download}
          target={target}
          rel={rel}
          className={commonClasses}
          onClick={onClick}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        className={commonClasses}
        onClick={onClick}
        {...props}
      >
        {content}
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";
export default InteractiveHoverButton;
