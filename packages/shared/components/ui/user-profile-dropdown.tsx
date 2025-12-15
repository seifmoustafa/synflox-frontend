"use client";

import { useState } from "react";
import { ChevronDown, Settings, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "@shared/lib/utils";

export interface UserProfileDropdownUser {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface UserProfileDropdownProps {
  user?: UserProfileDropdownUser | null;
  variant?: "default" | "compact" | "minimal" | "elegant" | "floating" | "modern" | "navigation" | "classic";
  showName?: boolean;
  showAvatar?: boolean;
  className?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  translations?: {
    profile?: string;
    settings?: string;
    logout?: string;
    user?: string;
  };
}

export function UserProfileDropdown({
  user,
  variant = "default",
  showName = true,
  showAvatar = true,
  className,
  onProfileClick,
  onSettingsClick,
  onLogout,
  translations = {},
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    profile = "Profile",
    settings = "Settings",
    logout = "Logout",
    user: userLabel = "User",
  } = translations;

  if (!user || !showAvatar) return null;

  const getInitials = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const firstInitial = firstName.charAt(0)?.toUpperCase() || "";
    const lastInitial = lastName.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || user.username?.charAt(0)?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.username || "User";
  };

  const handleProfileClick = () => {
    onProfileClick?.();
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    onSettingsClick?.();
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await onLogout?.();
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getAvatarSize = () => {
    switch (variant) {
      case "compact":
        return "h-8 w-8";
      case "minimal":
        return "h-7 w-7";
      case "floating":
        return "h-9 w-9";
      case "navigation":
        return "h-8 w-8";
      default:
        return "h-9 w-9";
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case "compact":
      case "minimal":
        return "text-xs";
      default:
        return "text-sm";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 p-2 hover:bg-accent/50 transition-colors h-10",
            variant === "navigation" && "h-9",
            variant === "floating" && "rounded-full",
            className
          )}
        >
          <Avatar className={cn(getAvatarSize(), "border-2 border-primary/20")}>
            {user.avatar && <AvatarImage src={user.avatar} alt={getDisplayName()} />}
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {showName && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-right rtl:text-left min-w-0">
                <p className={cn("font-medium truncate max-w-[120px]", getTextSize())}>
                  {getDisplayName()}
                </p>
                <p className="text-muted-foreground truncate max-w-[120px] text-xs">
                  {user.role || userLabel}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "transition-transform duration-200 flex-shrink-0",
                  isOpen && "rotate-180",
                  variant === "compact" ? "h-3 w-3" : "h-4 w-4"
                )}
              />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2" side="bottom">
        <div className="flex items-center gap-3 p-2 mb-2">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            {user.avatar && <AvatarImage src={user.avatar} alt={getDisplayName()} />}
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="text-right rtl:text-left min-w-0">
            <p className="font-medium text-sm truncate">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role || userLabel}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {onProfileClick && (
          <DropdownMenuItem
            onClick={handleProfileClick}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 rounded-md"
          >
            <User className="h-4 w-4" />
            <span>{profile}</span>
          </DropdownMenuItem>
        )}

        {onSettingsClick && (
          <DropdownMenuItem
            onClick={handleSettingsClick}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 rounded-md"
          >
            <Settings className="h-4 w-4" />
            <span>{settings}</span>
          </DropdownMenuItem>
        )}

        {onLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-destructive/10 text-destructive rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span>{logout}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
