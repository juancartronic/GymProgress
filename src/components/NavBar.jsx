import React from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Inicio", icon: "◉" },
  { id: "plans", label: "Planes", icon: "☰" },
  { id: "history", label: "Historial", icon: "◷" },
];

export function NavBar({ screen, setScreen, hasUser, accent, muted }) {
  if (!hasUser) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--nav-bg)", borderTop: "1px solid var(--border-main)", display: "flex", zIndex: 99 }}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id)}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            padding: "12px 0",
            cursor: "pointer",
            color: screen === item.id ? accent : muted,
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            fontWeight: screen === item.id ? 600 : 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            transition: "color .15s",
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
