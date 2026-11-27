import { Link } from "react-router-dom";
import { Mail, Briefcase, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Dock, DockIcon } from "@/registry/magicui/dock";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    url: "https://github.com/abijithspillai",
    isExternal: true,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/abijithspillai/",
    isExternal: true,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/abijithspillai/",
    isExternal: true,
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.62c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667.557 15.259.543 12 .543z" />
        <path d="M12 6.865c-2.841 0-5.135 2.294-5.135 5.135s2.294 5.135 5.135 5.135 5.135-2.294 5.135-5.135S14.841 6.865 12 6.865zm0 8.51c-1.864 0-3.375-1.511-3.375-3.375S10.136 8.625 12 8.625s3.375 1.511 3.375 3.375-1.511 3.375-3.375 3.375z" />
        <path d="M16.965 6.585a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
      </svg>
    ),
  },
  {
    name: "Email",
    url: "/contact",
    isExternal: false,
    icon: () => <Mail width="20" height="20" />,
  },
];

const QUICK_ACTIONS = [
  {
    name: "Projects",
    url: "/projects",
    isExternal: false,
    icon: () => <Briefcase width="20" height="20" />,
  },
  {
    name: "Resume",
    url: "/resume.pdf",
    isExternal: true,
    download: true,
    icon: () => <FileText width="20" height="20" />,
  },
];

export function SocialDock({ className, showActions = true, showTheme = false }) {
  return (
    <TooltipProvider>
      <Dock className={className} direction="middle">
        {SOCIAL_LINKS.map((item) => (
          <DockIcon key={item.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                {item.isExternal ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                  >
                    <item.icon />
                  </a>
                ) : (
                  <Link to={item.url} aria-label={item.name}>
                    <item.icon />
                  </Link>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}

        {showActions && (
          <>
            <Separator orientation="vertical" />
            {QUICK_ACTIONS.map((item) => (
              <DockIcon key={item.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {item.isExternal ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={item.download}
                        aria-label={item.name}
                      >
                        <item.icon />
                      </a>
                    ) : (
                      <Link to={item.url} aria-label={item.name}>
                        <item.icon />
                      </Link>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
          </>
        )}

        {showTheme && (
          <>
            <Separator orientation="vertical" />
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="dock-theme-wrapper">
                    <AnimatedThemeToggler />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </>
        )}
      </Dock>
    </TooltipProvider>
  );
}

export default SocialDock;
