"use client";

import * as React from "react";
import { User, Settings, LogOut, Shield, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface UserProfileDropdownProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  variant?: "default" | "compact" | "minimal" | "elegant" | "floating" | "modern" | "navigation" | "classic";
  showName?: boolean;
  showEmail?: boolean;
  showRole?: boolean;
  className?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onSecurityClick?: () => void;
  onNotificationsClick?: () => void;
  onLogout?: () => void;
  translations?: {
    profile?: string;
    settings?: string;
    security?: string;
    notifications?: string;
    logout?: string;
  };
}

export function UserProfileDropdown({
  user,
  onProfileClick,
  onSettingsClick,
  onSecurityClick,
  onNotificationsClick,
  onLogout,
  translations = {},
}: UserProfileDropdownProps) {
  const {
    profile = "Profile",
    settings = "Settings",
    security = "Security",
    notifications = "Notifications",
    logout = "Logout",
  } = translations;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || ""}
            </p>
            {user?.role && (
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {onProfileClick && (
            <DropdownMenuItem onClick={onProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>{profile}</span>
            </DropdownMenuItem>
          )}
          {onSettingsClick && (
            <DropdownMenuItem onClick={onSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{settings}</span>
            </DropdownMenuItem>
          )}
          {onSecurityClick && (
            <DropdownMenuItem onClick={onSecurityClick}>
              <Shield className="mr-2 h-4 w-4" />
              <span>{security}</span>
            </DropdownMenuItem>
          )}
          {onNotificationsClick && (
            <DropdownMenuItem onClick={onNotificationsClick}>
              <Bell className="mr-2 h-4 w-4" />
              <span>{notifications}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {onLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{logout}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
