import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

const pulseKeyframes = `
@keyframes skeleton-pulse {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}
`;

let injected = false;
function injectKeyframes() {
  if (injected) return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  injectKeyframes();
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "var(--text-muted, #555)",
        opacity: 0.3,
        animation: "skeleton-pulse 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ padding: 20, borderRadius: 16, background: "var(--card-bg, #18182a)", display: "flex", flexDirection: "column", gap: 14 }}>
      <Skeleton width="60%" height={22} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="80%" height={14} />
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <Skeleton width={60} height={36} borderRadius={10} />
        <Skeleton width={60} height={36} borderRadius={10} />
        <Skeleton width={60} height={36} borderRadius={10} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
      <Skeleton width="40%" height={32} borderRadius={10} />
      <SkeletonCard />
      <SkeletonCard />
      <Skeleton width="100%" height={48} borderRadius={12} />
    </div>
  );
}
