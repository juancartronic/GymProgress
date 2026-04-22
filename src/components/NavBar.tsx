import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NavBarProps {
  hasUser: boolean;
  accent: string;
  muted: string;
}

export function NavBar({ hasUser, accent, muted }: NavBarProps) {
  const { t } = useTranslation();
  if (!hasUser) return null;

  const NAV_ITEMS = [
    { to: "/dashboard", label: t("nav.home"), icon: "◉" },
    { to: "/plans", label: t("nav.plans"), icon: "☰" },
    { to: "/history", label: t("nav.history"), icon: "◷" },
    { to: "/yo", label: t("nav.profile"), icon: "👤" },
  ];

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--nav-bg)", borderTop: "1px solid var(--border-main)", display: "flex", zIndex: 99 }}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            flex: 1,
            background: "none",
            border: "none",
            padding: "12px 0",
            cursor: "pointer",
            color: isActive ? accent : muted,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            fontWeight: isActive ? 600 : 400,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: 4,
            transition: "color .15s",
            textDecoration: "none",
          })}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
