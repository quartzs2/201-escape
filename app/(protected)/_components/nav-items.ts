import { LayoutDashboardIcon, UsersIcon } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboardIcon, label: "대시보드" },
  { href: "/applications", icon: UsersIcon, label: "지원 목록" },
] as const;

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
