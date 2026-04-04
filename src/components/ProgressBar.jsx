import React from "react";

export function ProgressBar({ value, max, color = "#c8ff00", height = 6, trackColor = "#1e1e2e" }) {
  return (
    <div style={{ background: trackColor, borderRadius: 99, height, overflow: "hidden" }}>
      <div
        style={{
          background: color,
          width: `${Math.min(100, (value / max) * 100)}%`,
          height: "100%",
          borderRadius: 99,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}
