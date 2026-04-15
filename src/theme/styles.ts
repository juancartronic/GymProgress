import React from "react";

export const S = {
  app: { fontFamily: "'DM Sans',sans-serif", background: "var(--bg-main)", minHeight: "100vh", color: "var(--text-main)", overflowX: "hidden" },
  container: { maxWidth: 520, margin: "0 auto", padding: "0 16px 80px" },
  heading: { fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.05em" },
  card: { background: "var(--card-bg)", border: "1px solid var(--border-main)", borderRadius: 16, padding: "20px" },
  accent: "#c8ff00",
  orange: "#ff5500",
  muted: "var(--text-muted)",
  btn: (bg: string, fg = "#080810"): React.CSSProperties => ({
    background: bg,
    color: fg,
    border: "none",
    borderRadius: 12,
    padding: "14px 28px",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .15s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  }),
  pill: (color: string): React.CSSProperties => ({
    background: `${color}18`,
    color,
    border: `1px solid ${color}40`,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'DM Mono',monospace",
    letterSpacing: "0.05em",
  }),
  fieldLabel: { fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  fieldInput: {
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "var(--text-main)",
    fontSize: 15,
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
  },
};

export const APP_GLOBAL_CSS = `
  *{box-sizing:border-box}
  input:focus{outline:none}
  input::placeholder{color:var(--text-muted);opacity:1}
  select{outline:none}
  button:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
  button:active:not(:disabled){transform:translateY(0)}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:var(--scroll-track)}
  ::-webkit-scrollbar-thumb{background:var(--scroll-thumb);border-radius:2px}
`;
