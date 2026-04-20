import React from "react";
import type { ExerciseId, Gender } from "../types";

interface Point { x: number; y: number; }

interface Pose {
  head: Point; neck: Point;
  shoulderL: Point; shoulderR: Point;
  elbowL: Point; elbowR: Point;
  handL: Point; handR: Point;
  hipL: Point; hipR: Point;
  kneeL: Point; kneeR: Point;
  footL: Point; footR: Point;
}

/** Tapered limb with subtle muscle curvature via quadratic bezier bulge. */
function drawLimb(a: Point, b: Point, fill: string, sW: number, eW: number) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len, py = dx / len;
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const peak = Math.max(sW, eW) * 1.1;
  return (
    <path d={`M${a.x+px*sW} ${a.y+py*sW} Q${mx+px*peak} ${my+py*peak} ${b.x+px*eW} ${b.y+py*eW} L${b.x-px*eW} ${b.y-py*eW} Q${mx-px*peak} ${my-py*peak} ${a.x-px*sW} ${a.y-py*sW} Z`} fill={fill} />
  );
}

function CharacterFigure({ gender = "masculino", pose }: { gender?: Gender; pose: Pose }) {
  const skin = "#e8b898";
  const skinShade = "#c89878";
  const tshirt = gender === "femenino" ? "#e85588" : "#4a90d9";
  const tshirtShade = gender === "femenino" ? "#c43a68" : "#3570b0";
  const shortsCol = gender === "femenino" ? "#3a2850" : "#1e2d4a";
  const hair = "#1f1c26";
  const shoeCol = "#2a2a3e";
  const head = pose.head;
  const sL = pose.shoulderL, sR = pose.shoulderR;
  const hL = pose.hipL, hR = pose.hipR;
  const sC = { x: (sL.x + sR.x) / 2, y: (sL.y + sR.y) / 2 };
  const hC = { x: (hL.x + hR.x) / 2, y: (hL.y + hR.y) / 2 };

  /* Waist control‑points (pulled toward centre for hourglass) */
  const midL = { x: (sL.x + hL.x) / 2, y: (sL.y + hL.y) / 2 };
  const midR = { x: (sR.x + hR.x) / 2, y: (sR.y + hR.y) / 2 };
  const ctr  = { x: (midL.x + midR.x) / 2, y: (midL.y + midR.y) / 2 };
  const inset = gender === "femenino" ? 0.32 : 0.18;
  const wL = { x: midL.x + (ctr.x - midL.x) * inset, y: midL.y + (ctr.y - midL.y) * inset };
  const wR = { x: midR.x + (ctr.x - midR.x) * inset, y: midR.y + (ctr.y - midR.y) * inset };

  /* Shadow geometry */
  const footMaxY = Math.max(pose.footL.y, pose.footR.y);
  const shadowCX = (pose.footL.x + pose.footR.x) / 2;
  const shadowRX = Math.abs(pose.footR.x - pose.footL.x) / 2 + 10;

  return (
    <g>
      {/* Ground shadow */}
      <ellipse cx={shadowCX} cy={footMaxY + 4} rx={shadowRX} ry="3" fill="#000" opacity="0.12" />

      {/* ── Legs (thighs in shorts colour, calves in skin) ────────────── */}
      {drawLimb(hL, pose.kneeL, shortsCol, 3.5, 2.8)}
      {drawLimb(hR, pose.kneeR, shortsCol, 3.5, 2.8)}
      {drawLimb(pose.kneeL, pose.footL, skin, 2.8, 1.8)}
      {drawLimb(pose.kneeR, pose.footR, skin, 2.8, 1.8)}

      {/* ── Shoes ─────────────────────────────────────────────────────── */}
      <ellipse cx={pose.footL.x} cy={pose.footL.y+1} rx="7" ry="3.5" fill={shoeCol} />
      <ellipse cx={pose.footR.x} cy={pose.footR.y+1} rx="7" ry="3.5" fill={shoeCol} />

      {/* ── Torso (T‑shirt) ───────────────────────────────────────────── */}
      <path d={`M${sL.x} ${sL.y} L${sR.x} ${sR.y} Q${wR.x} ${wR.y} ${hR.x} ${hR.y} L${hL.x} ${hL.y} Q${wL.x} ${wL.y} ${sL.x} ${sL.y} Z`} fill={tshirt} />
      <line x1={sC.x} y1={sC.y+2} x2={hC.x} y2={hC.y-1} stroke={tshirtShade} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

      {/* ── Neck ──────────────────────────────────────────────────────── */}
      {drawLimb(pose.neck, sC, skin, 2.8, 2.2)}

      {/* ── Arms (upper + forearm in skin tone) ──────────────────────── */}
      {drawLimb(sL, pose.elbowL, skin, 2.8, 2.3)}
      {drawLimb(pose.elbowL, pose.handL, skin, 2.3, 1.6)}
      {drawLimb(sR, pose.elbowR, skin, 2.8, 2.3)}
      {drawLimb(pose.elbowR, pose.handR, skin, 2.3, 1.6)}

      {/* ── Hands ─────────────────────────────────────────────────────── */}
      <circle cx={pose.handL.x} cy={pose.handL.y} r="2.8" fill={skin} />
      <circle cx={pose.handR.x} cy={pose.handR.y} r="2.8" fill={skin} />

      {/* ── Joint accents ─────────────────────────────────────────────── */}
      {[pose.elbowL, pose.elbowR, pose.kneeL, pose.kneeR].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.8" fill={skinShade} opacity="0.35" />
      ))}

      {/* ── Head ──────────────────────────────────────────────────────── */}
      <circle cx={head.x} cy={head.y} r="9" fill={skin} />
      {/* Ears */}
      <ellipse cx={head.x-8.5} cy={head.y+1} rx="2" ry="3" fill={skinShade} />
      <ellipse cx={head.x-8.5} cy={head.y+1} rx="1.3" ry="2" fill={skin} />
      <ellipse cx={head.x+8.5} cy={head.y+1} rx="2" ry="3" fill={skinShade} />
      <ellipse cx={head.x+8.5} cy={head.y+1} rx="1.3" ry="2" fill={skin} />
      {/* Hair */}
      <path d={`M${head.x-9.5} ${head.y} Q${head.x-9.5} ${head.y-13} ${head.x} ${head.y-12.5} Q${head.x+9.5} ${head.y-13} ${head.x+9.5} ${head.y} L${head.x+8.5} ${head.y+2} Q${head.x} ${head.y-5.5} ${head.x-8.5} ${head.y+2} Z`} fill={hair} />
      <path d={`M${head.x-3} ${head.y-11.5} Q${head.x} ${head.y-13} ${head.x+3} ${head.y-11.5}`} stroke="#3a3648" strokeWidth="1.2" fill="none" opacity="0.4" />
      {/* Female ponytail */}
      {gender === "femenino" && (
        <path d={`M${head.x+8} ${head.y-2} Q${head.x+16} ${head.y+1} ${head.x+14} ${head.y+12}`} stroke={hair} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      )}
      {/* Eyebrows */}
      <line x1={head.x-4.5} y1={head.y-2.5} x2={head.x-1.5} y2={head.y-3} stroke="#2a2636" strokeWidth="1" strokeLinecap="round" />
      <line x1={head.x+1.5} y1={head.y-3} x2={head.x+4.5} y2={head.y-2.5} stroke="#2a2636" strokeWidth="1" strokeLinecap="round" />
      {/* Eyes (white + iris + highlight) */}
      <ellipse cx={head.x-3} cy={head.y+0.5} rx="1.6" ry="2" fill="white" />
      <ellipse cx={head.x+3} cy={head.y+0.5} rx="1.6" ry="2" fill="white" />
      <ellipse cx={head.x-3} cy={head.y+0.8} rx="1" ry="1.3" fill="#1a1a2e" />
      <ellipse cx={head.x+3} cy={head.y+0.8} rx="1" ry="1.3" fill="#1a1a2e" />
      <circle cx={head.x-2.4} cy={head.y+0.2} r="0.5" fill="white" />
      <circle cx={head.x+3.6} cy={head.y+0.2} r="0.5" fill="white" />
      {/* Nose */}
      <path d={`M${head.x} ${head.y+1.5} L${head.x-1} ${head.y+3.2} L${head.x+1} ${head.y+3.2}`} stroke={skinShade} strokeWidth="0.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Mouth */}
      <path d={`M${head.x-2.5} ${head.y+4.8} Q${head.x} ${head.y+6} ${head.x+2.5} ${head.y+4.8}`} stroke="#b05a4a" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

const P: Record<string, Pose> = {
  pushupUp: {
    head:{x:136,y:48}, neck:{x:126,y:53}, shoulderL:{x:116,y:58}, shoulderR:{x:122,y:58}, elbowL:{x:114,y:74}, elbowR:{x:120,y:74}, handL:{x:112,y:90}, handR:{x:118,y:90},
    hipL:{x:92,y:64}, hipR:{x:98,y:64}, kneeL:{x:72,y:77}, kneeR:{x:78,y:77}, footL:{x:52,y:90}, footR:{x:58,y:90}
  },
  pushupDown: {
    head:{x:136,y:57}, neck:{x:126,y:62}, shoulderL:{x:116,y:67}, shoulderR:{x:122,y:67}, elbowL:{x:108,y:79}, elbowR:{x:124,y:79}, handL:{x:112,y:90}, handR:{x:118,y:90},
    hipL:{x:92,y:72}, hipR:{x:98,y:72}, kneeL:{x:72,y:81}, kneeR:{x:78,y:81}, footL:{x:52,y:90}, footR:{x:58,y:90}
  },
  squatUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:76,y:53}, elbowR:{x:104,y:53}, handL:{x:74,y:64}, handR:{x:106,y:64},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  squatDown: {
    head:{x:90,y:42}, neck:{x:90,y:50}, shoulderL:{x:81,y:53}, shoulderR:{x:99,y:53}, elbowL:{x:72,y:60}, elbowR:{x:108,y:60}, handL:{x:66,y:64}, handR:{x:114,y:64},
    hipL:{x:84,y:74}, hipR:{x:96,y:74}, kneeL:{x:86,y:88}, kneeR:{x:94,y:88}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  lungeUp: {
    head:{x:92,y:30}, neck:{x:92,y:38}, shoulderL:{x:84,y:42}, shoulderR:{x:100,y:42}, elbowL:{x:80,y:54}, elbowR:{x:104,y:54}, handL:{x:80,y:64}, handR:{x:104,y:64},
    hipL:{x:86,y:62}, hipR:{x:98,y:62}, kneeL:{x:76,y:76}, kneeR:{x:114,y:78}, footL:{x:72,y:92}, footR:{x:126,y:92}
  },
  lungeDown: {
    head:{x:92,y:38}, neck:{x:92,y:46}, shoulderL:{x:84,y:50}, shoulderR:{x:100,y:50}, elbowL:{x:76,y:60}, elbowR:{x:108,y:60}, handL:{x:72,y:68}, handR:{x:112,y:68},
    hipL:{x:86,y:70}, hipR:{x:98,y:70}, kneeL:{x:72,y:84}, kneeR:{x:114,y:88}, footL:{x:72,y:92}, footR:{x:126,y:92}
  },
  plank: {
    head:{x:136,y:50}, neck:{x:126,y:55}, shoulderL:{x:118,y:58}, shoulderR:{x:124,y:60}, elbowL:{x:108,y:75}, elbowR:{x:114,y:76}, handL:{x:106,y:90}, handR:{x:112,y:90},
    hipL:{x:92,y:67}, hipR:{x:98,y:69}, kneeL:{x:72,y:78}, kneeR:{x:78,y:80}, footL:{x:52,y:90}, footR:{x:58,y:90}
  },
  burpeeA: {
    head:{x:92,y:40}, neck:{x:92,y:48}, shoulderL:{x:84,y:52}, shoulderR:{x:100,y:52}, elbowL:{x:74,y:58}, elbowR:{x:110,y:58}, handL:{x:66,y:62}, handR:{x:118,y:62},
    hipL:{x:86,y:70}, hipR:{x:98,y:70}, kneeL:{x:74,y:84}, kneeR:{x:110,y:84}, footL:{x:64,y:92}, footR:{x:120,y:92}
  },
  burpeeB: {
    head:{x:92,y:24}, neck:{x:92,y:32}, shoulderL:{x:84,y:36}, shoulderR:{x:100,y:36}, elbowL:{x:72,y:24}, elbowR:{x:112,y:24}, handL:{x:64,y:14}, handR:{x:120,y:14},
    hipL:{x:86,y:56}, hipR:{x:98,y:56}, kneeL:{x:76,y:74}, kneeR:{x:108,y:74}, footL:{x:70,y:92}, footR:{x:114,y:92}
  },
  curlDown: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:80,y:56}, elbowR:{x:100,y:56}, handL:{x:80,y:70}, handR:{x:100,y:70},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  curlUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:80,y:56}, elbowR:{x:100,y:56}, handL:{x:80,y:70}, handR:{x:96,y:44},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  pressDown: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:74,y:52}, elbowR:{x:106,y:52}, handL:{x:72,y:44}, handR:{x:108,y:44},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  pressUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:80,y:30}, elbowR:{x:100,y:30}, handL:{x:78,y:18}, handR:{x:102,y:18},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  climberA: {
    head:{x:136,y:49}, neck:{x:126,y:55}, shoulderL:{x:114,y:58}, shoulderR:{x:120,y:58}, elbowL:{x:114,y:74}, elbowR:{x:120,y:74}, handL:{x:114,y:90}, handR:{x:120,y:90},
    hipL:{x:92,y:67}, hipR:{x:98,y:69}, kneeL:{x:104,y:78}, kneeR:{x:78,y:80}, footL:{x:104,y:90}, footR:{x:58,y:90}
  },
  climberB: {
    head:{x:136,y:49}, neck:{x:126,y:55}, shoulderL:{x:114,y:58}, shoulderR:{x:120,y:58}, elbowL:{x:114,y:74}, elbowR:{x:120,y:74}, handL:{x:114,y:90}, handR:{x:120,y:90},
    hipL:{x:92,y:67}, hipR:{x:98,y:69}, kneeL:{x:72,y:80}, kneeR:{x:110,y:78}, footL:{x:52,y:90}, footR:{x:110,y:90}
  },
  jackClose: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:80,y:56}, elbowR:{x:100,y:56}, handL:{x:80,y:70}, handR:{x:100,y:70},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:84,y:92}, footR:{x:96,y:92}
  },
  jackOpen: {
    head:{x:90,y:28}, neck:{x:90,y:36}, shoulderL:{x:82,y:40}, shoulderR:{x:98,y:40}, elbowL:{x:70,y:28}, elbowR:{x:110,y:28}, handL:{x:62,y:16}, handR:{x:118,y:16},
    hipL:{x:84,y:60}, hipR:{x:96,y:60}, kneeL:{x:72,y:78}, kneeR:{x:108,y:78}, footL:{x:62,y:92}, footR:{x:118,y:92}
  },
  bridgeLow: {
    head:{x:132,y:78}, neck:{x:122,y:80}, shoulderL:{x:112,y:82}, shoulderR:{x:118,y:84}, elbowL:{x:108,y:86}, elbowR:{x:114,y:88}, handL:{x:104,y:92}, handR:{x:110,y:92},
    hipL:{x:86,y:82}, hipR:{x:92,y:84}, kneeL:{x:72,y:86}, kneeR:{x:78,y:88}, footL:{x:66,y:92}, footR:{x:74,y:92}
  },
  bridgeHigh: {
    head:{x:132,y:78}, neck:{x:122,y:80}, shoulderL:{x:112,y:82}, shoulderR:{x:118,y:84}, elbowL:{x:108,y:86}, elbowR:{x:114,y:88}, handL:{x:104,y:92}, handR:{x:110,y:92},
    hipL:{x:86,y:70}, hipR:{x:92,y:72}, kneeL:{x:74,y:82}, kneeR:{x:80,y:84}, footL:{x:66,y:92}, footR:{x:74,y:92}
  },
  // ── Row (bent-over pull) ─────────────────────────────────────────────────
  rowDown: {
    head:{x:110,y:36}, neck:{x:104,y:42}, shoulderL:{x:96,y:46}, shoulderR:{x:112,y:46}, elbowL:{x:92,y:62}, elbowR:{x:116,y:62}, handL:{x:90,y:76}, handR:{x:118,y:76},
    hipL:{x:84,y:60}, hipR:{x:96,y:60}, kneeL:{x:78,y:78}, kneeR:{x:102,y:78}, footL:{x:74,y:92}, footR:{x:106,y:92}
  },
  rowUp: {
    head:{x:110,y:36}, neck:{x:104,y:42}, shoulderL:{x:96,y:46}, shoulderR:{x:112,y:46}, elbowL:{x:88,y:48}, elbowR:{x:120,y:48}, handL:{x:90,y:58}, handR:{x:118,y:58},
    hipL:{x:84,y:60}, hipR:{x:96,y:60}, kneeL:{x:78,y:78}, kneeR:{x:102,y:78}, footL:{x:74,y:92}, footR:{x:106,y:92}
  },
  // ── Pull-up ──────────────────────────────────────────────────────────────
  pullupDown: {
    head:{x:90,y:34}, neck:{x:90,y:42}, shoulderL:{x:78,y:46}, shoulderR:{x:102,y:46}, elbowL:{x:70,y:32}, elbowR:{x:110,y:32}, handL:{x:68,y:20}, handR:{x:112,y:20},
    hipL:{x:84,y:66}, hipR:{x:96,y:66}, kneeL:{x:82,y:80}, kneeR:{x:98,y:80}, footL:{x:80,y:92}, footR:{x:100,y:92}
  },
  pullupUp: {
    head:{x:90,y:24}, neck:{x:90,y:32}, shoulderL:{x:78,y:36}, shoulderR:{x:102,y:36}, elbowL:{x:68,y:26}, elbowR:{x:112,y:26}, handL:{x:68,y:16}, handR:{x:112,y:16},
    hipL:{x:84,y:56}, hipR:{x:96,y:56}, kneeL:{x:80,y:72}, kneeR:{x:100,y:72}, footL:{x:78,y:86}, footR:{x:102,y:86}
  },
  // ── Superman (prone, arms+legs raised) ───────────────────────────────────
  supermanLow: {
    head:{x:130,y:68}, neck:{x:122,y:72}, shoulderL:{x:114,y:74}, shoulderR:{x:120,y:76}, elbowL:{x:136,y:74}, elbowR:{x:140,y:76}, handL:{x:148,y:74}, handR:{x:152,y:76},
    hipL:{x:90,y:80}, hipR:{x:96,y:82}, kneeL:{x:72,y:84}, kneeR:{x:78,y:86}, footL:{x:54,y:88}, footR:{x:60,y:90}
  },
  supermanHigh: {
    head:{x:130,y:60}, neck:{x:122,y:66}, shoulderL:{x:114,y:68}, shoulderR:{x:120,y:70}, elbowL:{x:138,y:62}, elbowR:{x:142,y:64}, handL:{x:152,y:56}, handR:{x:156,y:58},
    hipL:{x:90,y:78}, hipR:{x:96,y:80}, kneeL:{x:72,y:78}, kneeR:{x:78,y:80}, footL:{x:54,y:72}, footR:{x:60,y:74}
  },
  // ── Dip (bench dip) ──────────────────────────────────────────────────────
  dipUp: {
    head:{x:90,y:28}, neck:{x:90,y:36}, shoulderL:{x:80,y:40}, shoulderR:{x:100,y:40}, elbowL:{x:74,y:52}, elbowR:{x:106,y:52}, handL:{x:70,y:46}, handR:{x:110,y:46},
    hipL:{x:84,y:58}, hipR:{x:96,y:58}, kneeL:{x:78,y:76}, kneeR:{x:102,y:76}, footL:{x:74,y:92}, footR:{x:106,y:92}
  },
  dipDown: {
    head:{x:90,y:40}, neck:{x:90,y:48}, shoulderL:{x:80,y:52}, shoulderR:{x:100,y:52}, elbowL:{x:70,y:52}, elbowR:{x:110,y:52}, handL:{x:70,y:46}, handR:{x:110,y:46},
    hipL:{x:84,y:72}, hipR:{x:96,y:72}, kneeL:{x:78,y:84}, kneeR:{x:102,y:84}, footL:{x:74,y:92}, footR:{x:106,y:92}
  },
  // ── Tricep Extension ─────────────────────────────────────────────────────
  tricepDown: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:82,y:28}, elbowR:{x:98,y:28}, handL:{x:82,y:38}, handR:{x:98,y:38},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  tricepUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:82,y:28}, elbowR:{x:98,y:28}, handL:{x:82,y:16}, handR:{x:98,y:16},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  // ── Crunch ───────────────────────────────────────────────────────────────
  crunchDown: {
    head:{x:120,y:72}, neck:{x:112,y:76}, shoulderL:{x:106,y:80}, shoulderR:{x:118,y:80}, elbowL:{x:112,y:72}, elbowR:{x:124,y:72}, handL:{x:116,y:68}, handR:{x:128,y:68},
    hipL:{x:82,y:82}, hipR:{x:88,y:84}, kneeL:{x:66,y:72}, kneeR:{x:72,y:74}, footL:{x:56,y:88}, footR:{x:62,y:90}
  },
  crunchUp: {
    head:{x:108,y:62}, neck:{x:102,y:68}, shoulderL:{x:96,y:72}, shoulderR:{x:108,y:72}, elbowL:{x:102,y:64}, elbowR:{x:114,y:64}, handL:{x:106,y:58}, handR:{x:118,y:58},
    hipL:{x:82,y:82}, hipR:{x:88,y:84}, kneeL:{x:66,y:72}, kneeR:{x:72,y:74}, footL:{x:56,y:88}, footR:{x:62,y:90}
  },
  // ── Russian Twist ────────────────────────────────────────────────────────
  twistL: {
    head:{x:90,y:42}, neck:{x:90,y:50}, shoulderL:{x:82,y:54}, shoulderR:{x:98,y:54}, elbowL:{x:70,y:56}, elbowR:{x:78,y:60}, handL:{x:62,y:58}, handR:{x:72,y:62},
    hipL:{x:84,y:72}, hipR:{x:96,y:72}, kneeL:{x:76,y:82}, kneeR:{x:104,y:82}, footL:{x:72,y:92}, footR:{x:108,y:92}
  },
  twistR: {
    head:{x:90,y:42}, neck:{x:90,y:50}, shoulderL:{x:82,y:54}, shoulderR:{x:98,y:54}, elbowL:{x:102,y:60}, elbowR:{x:110,y:56}, handL:{x:108,y:62}, handR:{x:118,y:58},
    hipL:{x:84,y:72}, hipR:{x:96,y:72}, kneeL:{x:76,y:82}, kneeR:{x:104,y:82}, footL:{x:72,y:92}, footR:{x:108,y:92}
  },
  // ── High Knees ───────────────────────────────────────────────────────────
  highKneesA: {
    head:{x:90,y:26}, neck:{x:90,y:34}, shoulderL:{x:82,y:38}, shoulderR:{x:98,y:38}, elbowL:{x:76,y:48}, elbowR:{x:98,y:30}, handL:{x:74,y:56}, handR:{x:100,y:22},
    hipL:{x:84,y:58}, hipR:{x:96,y:58}, kneeL:{x:82,y:48}, kneeR:{x:100,y:78}, footL:{x:78,y:58}, footR:{x:102,y:92}
  },
  highKneesB: {
    head:{x:90,y:26}, neck:{x:90,y:34}, shoulderL:{x:82,y:38}, shoulderR:{x:98,y:38}, elbowL:{x:82,y:30}, elbowR:{x:104,y:48}, handL:{x:80,y:22}, handR:{x:106,y:56},
    hipL:{x:84,y:58}, hipR:{x:96,y:58}, kneeL:{x:80,y:78}, kneeR:{x:98,y:48}, footL:{x:78,y:92}, footR:{x:102,y:58}
  },
  // ── Skater ───────────────────────────────────────────────────────────────
  skaterL: {
    head:{x:72,y:32}, neck:{x:76,y:40}, shoulderL:{x:68,y:44}, shoulderR:{x:84,y:44}, elbowL:{x:60,y:54}, elbowR:{x:92,y:50}, handL:{x:56,y:62}, handR:{x:98,y:44},
    hipL:{x:72,y:62}, hipR:{x:80,y:62}, kneeL:{x:68,y:78}, kneeR:{x:90,y:72}, footL:{x:64,y:92}, footR:{x:96,y:82}
  },
  skaterR: {
    head:{x:108,y:32}, neck:{x:104,y:40}, shoulderL:{x:96,y:44}, shoulderR:{x:112,y:44}, elbowL:{x:88,y:50}, elbowR:{x:120,y:54}, handL:{x:82,y:44}, handR:{x:124,y:62},
    hipL:{x:100,y:62}, hipR:{x:108,y:62}, kneeL:{x:90,y:72}, kneeR:{x:112,y:78}, footL:{x:84,y:82}, footR:{x:116,y:92}
  },
  // ── Calf Raise ───────────────────────────────────────────────────────────
  calfLow: {
    head:{x:90,y:28}, neck:{x:90,y:36}, shoulderL:{x:82,y:40}, shoulderR:{x:98,y:40}, elbowL:{x:80,y:54}, elbowR:{x:100,y:54}, handL:{x:80,y:66}, handR:{x:100,y:66},
    hipL:{x:84,y:60}, hipR:{x:96,y:60}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  calfHigh: {
    head:{x:90,y:22}, neck:{x:90,y:30}, shoulderL:{x:82,y:34}, shoulderR:{x:98,y:34}, elbowL:{x:80,y:48}, elbowR:{x:100,y:48}, handL:{x:80,y:60}, handR:{x:100,y:60},
    hipL:{x:84,y:54}, hipR:{x:96,y:54}, kneeL:{x:84,y:72}, kneeR:{x:96,y:72}, footL:{x:82,y:86}, footR:{x:98,y:86}
  },
  // ── Lateral Raise ────────────────────────────────────────────────────────
  latRaiseDown: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:78,y:56}, elbowR:{x:102,y:56}, handL:{x:76,y:68}, handR:{x:104,y:68},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  latRaiseUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42}, elbowL:{x:66,y:40}, elbowR:{x:114,y:40}, handL:{x:52,y:42}, handR:{x:128,y:42},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  // ── Jump Squat ───────────────────────────────────────────────────────────
  jumpSquatDown: {
    head:{x:90,y:42}, neck:{x:90,y:50}, shoulderL:{x:81,y:53}, shoulderR:{x:99,y:53}, elbowL:{x:72,y:60}, elbowR:{x:108,y:60}, handL:{x:66,y:64}, handR:{x:114,y:64},
    hipL:{x:84,y:74}, hipR:{x:96,y:74}, kneeL:{x:86,y:88}, kneeR:{x:94,y:88}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  jumpSquatUp: {
    head:{x:90,y:20}, neck:{x:90,y:28}, shoulderL:{x:82,y:32}, shoulderR:{x:98,y:32}, elbowL:{x:72,y:22}, elbowR:{x:108,y:22}, handL:{x:66,y:14}, handR:{x:114,y:14},
    hipL:{x:84,y:52}, hipR:{x:96,y:52}, kneeL:{x:82,y:68}, kneeR:{x:98,y:68}, footL:{x:80,y:82}, footR:{x:100,y:82}
  },
  // ── DB Chest Press (lying, press up) ─────────────────────────────────────
  dbChestPressDown: {
    head:{x:130,y:74}, neck:{x:122,y:78}, shoulderL:{x:114,y:80}, shoulderR:{x:120,y:82},
    elbowL:{x:108,y:72}, elbowR:{x:126,y:74}, handL:{x:102,y:68}, handR:{x:132,y:70},
    hipL:{x:86,y:82}, hipR:{x:92,y:84}, kneeL:{x:72,y:72}, kneeR:{x:78,y:74}, footL:{x:62,y:88}, footR:{x:68,y:90}
  },
  dbChestPressUp: {
    head:{x:130,y:74}, neck:{x:122,y:78}, shoulderL:{x:114,y:80}, shoulderR:{x:120,y:82},
    elbowL:{x:112,y:64}, elbowR:{x:122,y:66}, handL:{x:110,y:52}, handR:{x:124,y:54},
    hipL:{x:86,y:82}, hipR:{x:92,y:84}, kneeL:{x:72,y:72}, kneeR:{x:78,y:74}, footL:{x:62,y:88}, footR:{x:68,y:90}
  },
  // ── DB Fly (lying, open/close arms) ──────────────────────────────────────
  dbFlyOpen: {
    head:{x:130,y:74}, neck:{x:122,y:78}, shoulderL:{x:114,y:80}, shoulderR:{x:120,y:82},
    elbowL:{x:102,y:70}, elbowR:{x:134,y:72}, handL:{x:94,y:66}, handR:{x:142,y:68},
    hipL:{x:86,y:82}, hipR:{x:92,y:84}, kneeL:{x:72,y:72}, kneeR:{x:78,y:74}, footL:{x:62,y:88}, footR:{x:68,y:90}
  },
  dbFlyClosed: {
    head:{x:130,y:74}, neck:{x:122,y:78}, shoulderL:{x:114,y:80}, shoulderR:{x:120,y:82},
    elbowL:{x:112,y:66}, elbowR:{x:124,y:68}, handL:{x:114,y:56}, handR:{x:122,y:58},
    hipL:{x:86,y:82}, hipR:{x:92,y:84}, kneeL:{x:72,y:72}, kneeR:{x:78,y:74}, footL:{x:62,y:88}, footR:{x:68,y:90}
  },
  // ── Romanian Deadlift (hip hinge with dumbbells) ─────────────────────────
  rdlUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:80,y:56}, elbowR:{x:100,y:56}, handL:{x:80,y:68}, handR:{x:100,y:68},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  rdlDown: {
    head:{x:110,y:38}, neck:{x:104,y:44}, shoulderL:{x:96,y:48}, shoulderR:{x:112,y:48},
    elbowL:{x:92,y:62}, elbowR:{x:116,y:62}, handL:{x:90,y:74}, handR:{x:118,y:74},
    hipL:{x:84,y:60}, hipR:{x:96,y:60}, kneeL:{x:82,y:78}, kneeR:{x:98,y:78}, footL:{x:80,y:92}, footR:{x:100,y:92}
  },
  // ── Goblet Squat (dumbbell held at chest) ────────────────────────────────
  gobletUp: {
    head:{x:90,y:28}, neck:{x:90,y:36}, shoulderL:{x:82,y:40}, shoulderR:{x:98,y:40},
    elbowL:{x:78,y:50}, elbowR:{x:102,y:50}, handL:{x:86,y:44}, handR:{x:94,y:44},
    hipL:{x:84,y:60}, hipR:{x:96,y:60}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  gobletDown: {
    head:{x:90,y:40}, neck:{x:90,y:48}, shoulderL:{x:81,y:52}, shoulderR:{x:99,y:52},
    elbowL:{x:74,y:58}, elbowR:{x:106,y:58}, handL:{x:86,y:52}, handR:{x:94,y:52},
    hipL:{x:84,y:72}, hipR:{x:96,y:72}, kneeL:{x:82,y:86}, kneeR:{x:98,y:86}, footL:{x:80,y:92}, footR:{x:100,y:92}
  },
  // ── Band Pull Apart (standing, horizontal pull) ──────────────────────────
  bandPullClose: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:78,y:42}, elbowR:{x:102,y:42}, handL:{x:82,y:42}, handR:{x:98,y:42},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  bandPullOpen: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:66,y:42}, elbowR:{x:114,y:42}, handL:{x:52,y:42}, handR:{x:128,y:42},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  // ── Band Row (standing, pull to waist) ───────────────────────────────────
  bandRowFwd: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:78,y:50}, elbowR:{x:102,y:50}, handL:{x:76,y:56}, handR:{x:104,y:56},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  bandRowBack: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:72,y:46}, elbowR:{x:108,y:46}, handL:{x:80,y:52}, handR:{x:100,y:52},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  // ── Band Face Pull (pull to face level) ──────────────────────────────────
  facePullFwd: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:78,y:42}, elbowR:{x:102,y:42}, handL:{x:76,y:48}, handR:{x:104,y:48},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  facePullBack: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:68,y:34}, elbowR:{x:112,y:34}, handL:{x:76,y:28}, handR:{x:104,y:28},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  // ── Band Pallof Press (anti-rotation press) ──────────────────────────────
  pallofIn: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:80,y:50}, elbowR:{x:100,y:50}, handL:{x:88,y:48}, handR:{x:92,y:48},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  pallofOut: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:82,y:42}, elbowR:{x:98,y:42}, handL:{x:90,y:42}, handR:{x:90,y:42},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  // ── Band Bicep Curl (standing, band underfoot) ───────────────────────────
  bandCurlDown: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:80,y:56}, elbowR:{x:100,y:56}, handL:{x:80,y:70}, handR:{x:100,y:70},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  bandCurlUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:80,y:56}, elbowR:{x:100,y:56}, handL:{x:82,y:44}, handR:{x:98,y:44},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  // ── Band Lateral Walk (mini-squat, side step) ────────────────────────────
  latWalkL: {
    head:{x:82,y:34}, neck:{x:82,y:42}, shoulderL:{x:74,y:46}, shoulderR:{x:90,y:46},
    elbowL:{x:70,y:54}, elbowR:{x:94,y:54}, handL:{x:74,y:48}, handR:{x:90,y:48},
    hipL:{x:76,y:64}, hipR:{x:88,y:64}, kneeL:{x:70,y:78}, kneeR:{x:92,y:78}, footL:{x:64,y:92}, footR:{x:96,y:92}
  },
  latWalkR: {
    head:{x:98,y:34}, neck:{x:98,y:42}, shoulderL:{x:90,y:46}, shoulderR:{x:106,y:46},
    elbowL:{x:86,y:54}, elbowR:{x:110,y:54}, handL:{x:90,y:48}, handR:{x:106,y:48},
    hipL:{x:92,y:64}, hipR:{x:104,y:64}, kneeL:{x:88,y:78}, kneeR:{x:110,y:78}, footL:{x:84,y:92}, footR:{x:116,y:92}
  },
  // ── Floor Wiper (lying, legs side to side) ───────────────────────────────
  floorWiperL: {
    head:{x:130,y:76}, neck:{x:122,y:80}, shoulderL:{x:114,y:82}, shoulderR:{x:120,y:84},
    elbowL:{x:108,y:76}, elbowR:{x:126,y:78}, handL:{x:102,y:72}, handR:{x:132,y:74},
    hipL:{x:86,y:82}, hipR:{x:92,y:84}, kneeL:{x:68,y:68}, kneeR:{x:74,y:70}, footL:{x:56,y:62}, footR:{x:62,y:64}
  },
  floorWiperR: {
    head:{x:130,y:76}, neck:{x:122,y:80}, shoulderL:{x:114,y:82}, shoulderR:{x:120,y:84},
    elbowL:{x:108,y:76}, elbowR:{x:126,y:78}, handL:{x:102,y:72}, handR:{x:132,y:74},
    hipL:{x:86,y:82}, hipR:{x:92,y:84}, kneeL:{x:100,y:68}, kneeR:{x:106,y:70}, footL:{x:108,y:62}, footR:{x:114,y:64}
  },
  // ── Reverse Lunge (step back lunge) ──────────────────────────────────────
  revLungeUp: {
    head:{x:90,y:30}, neck:{x:90,y:38}, shoulderL:{x:82,y:42}, shoulderR:{x:98,y:42},
    elbowL:{x:78,y:54}, elbowR:{x:102,y:54}, handL:{x:78,y:66}, handR:{x:102,y:66},
    hipL:{x:84,y:62}, hipR:{x:96,y:62}, kneeL:{x:84,y:78}, kneeR:{x:96,y:78}, footL:{x:82,y:92}, footR:{x:98,y:92}
  },
  revLungeDown: {
    head:{x:90,y:38}, neck:{x:90,y:46}, shoulderL:{x:82,y:50}, shoulderR:{x:98,y:50},
    elbowL:{x:78,y:60}, elbowR:{x:102,y:60}, handL:{x:78,y:70}, handR:{x:102,y:70},
    hipL:{x:84,y:68}, hipR:{x:96,y:68}, kneeL:{x:82,y:84}, kneeR:{x:106,y:86}, footL:{x:80,y:92}, footR:{x:118,y:92}
  },
};

const POSES: Record<string, [Pose, Pose]> = {
  pushup: [P.pushupUp, P.pushupDown],
  squat: [P.squatUp, P.squatDown],
  lunge: [P.lungeUp, P.lungeDown],
  plank: [P.plank, P.plank],
  burpee: [P.burpeeA, P.burpeeB],
  curl: [P.curlDown, P.curlUp],
  press: [P.pressDown, P.pressUp],
  mtnclimber: [P.climberA, P.climberB],
  jumpingjack: [P.jackClose, P.jackOpen],
  hipbridge: [P.bridgeLow, P.bridgeHigh],
  row: [P.rowDown, P.rowUp],
  pullup: [P.pullupDown, P.pullupUp],
  superman: [P.supermanLow, P.supermanHigh],
  dip: [P.dipUp, P.dipDown],
  tricepext: [P.tricepDown, P.tricepUp],
  crunch: [P.crunchDown, P.crunchUp],
  russiantwist: [P.twistL, P.twistR],
  highknees: [P.highKneesA, P.highKneesB],
  skater: [P.skaterL, P.skaterR],
  calfraise: [P.calfLow, P.calfHigh],
  lateralraise: [P.latRaiseDown, P.latRaiseUp],
  jumpsquat: [P.jumpSquatDown, P.jumpSquatUp],
  dbchestpress: [P.dbChestPressDown, P.dbChestPressUp],
  dbfly: [P.dbFlyOpen, P.dbFlyClosed],
  rdl: [P.rdlUp, P.rdlDown],
  gobletsquat: [P.gobletUp, P.gobletDown],
  bandpullapart: [P.bandPullClose, P.bandPullOpen],
  bandrow: [P.bandRowFwd, P.bandRowBack],
  bandfacepull: [P.facePullFwd, P.facePullBack],
  bandpallof: [P.pallofIn, P.pallofOut],
  bandbicepcurl: [P.bandCurlDown, P.bandCurlUp],
  bandlateralwalk: [P.latWalkL, P.latWalkR],
  floorwiper: [P.floorWiperL, P.floorWiperR],
  reverselunge: [P.revLungeUp, P.revLungeDown],
};

const humanExercise = (kind: string, c: string, gender: Gender) => {
  const [a, b] = POSES[kind] || POSES.pushup;
  const isStatic = kind === "plank";
  const dur = kind === "pushup" ? 1.5 : 1.8;
  const uid = `ex_${kind}`;
  /* alternate direction → smooth A↔B oscillation with no loop‑jump */
  const anim = `
    @keyframes ${uid}A{0%{opacity:1}100%{opacity:0}}
    @keyframes ${uid}B{0%{opacity:0}100%{opacity:1}}
    .${uid}A{animation:${uid}A ${dur}s ease-in-out infinite alternate}
    .${uid}B{animation:${uid}B ${dur}s ease-in-out infinite alternate}
  `;
  return (
    <svg viewBox="0 0 180 120" fill="none" style={{width:"100%",height:"100%",overflow:"visible"}}>
      <defs>
        <linearGradient id={`${uid}_bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e1225"/>
          <stop offset="80%" stopColor="#141a32"/>
          <stop offset="100%" stopColor="#1a2545"/>
        </linearGradient>
      </defs>
      <style>{anim}</style>
      <rect x="1" y="1" width="178" height="118" rx="16" fill={`url(#${uid}_bg)`} stroke="#2f375f"/>
      <line x1="16" y1="96" x2="164" y2="96" stroke={c} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.22"/>
      {isStatic ? (
        <CharacterFigure gender={gender} pose={a} />
      ) : (
        <>
          <g className={`${uid}A`}><CharacterFigure gender={gender} pose={a} /></g>
          <g className={`${uid}B`}><CharacterFigure gender={gender} pose={b} /></g>
        </>
      )}
    </svg>
  );
};

export const ILLUS: Record<ExerciseId, (c: string, gender: Gender) => React.ReactNode> = {
  pushup: (c, gender) => humanExercise("pushup", c, gender),
  squat: (c, gender) => humanExercise("squat", c, gender),
  lunge: (c, gender) => humanExercise("lunge", c, gender),
  plank: (c, gender) => humanExercise("plank", c, gender),
  burpee: (c, gender) => humanExercise("burpee", c, gender),
  curl: (c, gender) => humanExercise("curl", c, gender),
  press: (c, gender) => humanExercise("press", c, gender),
  mtnclimber: (c, gender) => humanExercise("mtnclimber", c, gender),
  jumpingjack: (c, gender) => humanExercise("jumpingjack", c, gender),
  hipbridge: (c, gender) => humanExercise("hipbridge", c, gender),
  row: (c, gender) => humanExercise("row", c, gender),
  pullup: (c, gender) => humanExercise("pullup", c, gender),
  superman: (c, gender) => humanExercise("superman", c, gender),
  dip: (c, gender) => humanExercise("dip", c, gender),
  tricepext: (c, gender) => humanExercise("tricepext", c, gender),
  crunch: (c, gender) => humanExercise("crunch", c, gender),
  russiantwist: (c, gender) => humanExercise("russiantwist", c, gender),
  highknees: (c, gender) => humanExercise("highknees", c, gender),
  skater: (c, gender) => humanExercise("skater", c, gender),
  calfraise: (c, gender) => humanExercise("calfraise", c, gender),
  lateralraise: (c, gender) => humanExercise("lateralraise", c, gender),
  jumpsquat: (c, gender) => humanExercise("jumpsquat", c, gender),
  dbchestpress: (c, gender) => humanExercise("dbchestpress", c, gender),
  dbfly: (c, gender) => humanExercise("dbfly", c, gender),
  rdl: (c, gender) => humanExercise("rdl", c, gender),
  gobletsquat: (c, gender) => humanExercise("gobletsquat", c, gender),
  bandpullapart: (c, gender) => humanExercise("bandpullapart", c, gender),
  bandrow: (c, gender) => humanExercise("bandrow", c, gender),
  bandfacepull: (c, gender) => humanExercise("bandfacepull", c, gender),
  bandpallof: (c, gender) => humanExercise("bandpallof", c, gender),
  bandbicepcurl: (c, gender) => humanExercise("bandbicepcurl", c, gender),
  bandlateralwalk: (c, gender) => humanExercise("bandlateralwalk", c, gender),
  floorwiper: (c, gender) => humanExercise("floorwiper", c, gender),
  reverselunge: (c, gender) => humanExercise("reverselunge", c, gender),
};
