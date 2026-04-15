import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS: Array<{ to: string; label: string; icon: string }> = [
  { to: "/dashboard", label: "Inicio", icon: "◉" },
  { to: "/plans", label: "Planes", icon: "☰" },
  { to: "/history", label: "Historial", icon: "◷" },
];

interface NavBarProps {
  hasUser: boolean;
  accent: string;
  muted: string;
}

export function NavBar({ hasUser, accent, muted }: NavBarProps) {
  if (!hasUser) return null;

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
