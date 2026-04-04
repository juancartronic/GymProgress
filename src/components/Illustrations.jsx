import React from "react";

const drawSeg = (a, b, color, width = 5) => (
  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
);

function CharacterFigure({ gender = "masculino", pose }) {
  const skin = "#f4c8a8";
  const line = gender === "femenino" ? "#ff7c9f" : "#62adff";
  const short = "#d8ebff";
  const head = pose.head;
  const hipC = { x: (pose.hipL.x + pose.hipR.x) / 2, y: (pose.hipL.y + pose.hipR.y) / 2 };

  return (
    <g>
      <circle cx={head.x} cy={head.y} r="8" fill={skin} />
      <path d={`M${head.x-8} ${head.y-2} Q${head.x} ${head.y-12} ${head.x+8} ${head.y-2} L${head.x+8} ${head.y+1} Q${head.x} ${head.y-5} ${head.x-8} ${head.y+1} Z`} fill="#1f1c26" />
      {gender === "femenino" && <circle cx={head.x+9} cy={head.y+4} r="4" fill="#1f1c26" />}
      <circle cx={head.x-3} cy={head.y+1} r="0.9" fill="#1f1f1f" />
      <circle cx={head.x+3} cy={head.y+1} r="0.9" fill="#1f1f1f" />
      <path d={`M${head.x-3} ${head.y+4} Q${head.x} ${head.y+5} ${head.x+3} ${head.y+4}`} stroke="#9f5d58" strokeWidth="1" fill="none" strokeLinecap="round" />

      {drawSeg(pose.neck, pose.shoulderL, line, 5)}
      {drawSeg(pose.neck, pose.shoulderR, line, 5)}
      {drawSeg(pose.neck, hipC, line, 6)}
      {drawSeg(pose.hipL, pose.hipR, short, 6)}

      {drawSeg(pose.shoulderL, pose.elbowL, skin, 5)}
      {drawSeg(pose.elbowL, pose.handL, skin, 5)}
      {drawSeg(pose.shoulderR, pose.elbowR, skin, 5)}
      {drawSeg(pose.elbowR, pose.handR, skin, 5)}

      {drawSeg(pose.hipL, pose.kneeL, line, 6)}
      {drawSeg(pose.kneeL, pose.footL, line, 6)}
      {drawSeg(pose.hipR, pose.kneeR, line, 6)}
      {drawSeg(pose.kneeR, pose.footR, line, 6)}

      {[pose.neck, pose.shoulderL, pose.shoulderR, pose.elbowL, pose.elbowR, pose.handL, pose.handR, pose.hipL, pose.hipR, pose.kneeL, pose.kneeR].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#f0f4ff" opacity="0.9" />
      ))}
      <ellipse cx={pose.footL.x} cy={pose.footL.y+1} rx="6" ry="2.8" fill="#eef3ff" />
      <ellipse cx={pose.footR.x} cy={pose.footR.y+1} rx="6" ry="2.8" fill="#eef3ff" />
    </g>
  );
}

const P = {
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
};

const POSES = {
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
};

const humanExercise = (kind, c, gender) => {
  const [a, b] = POSES[kind] || POSES.pushup;
  const isStatic = kind === "plank";
  const duration = kind === "pushup" ? 1.9 : 2.2;
  const anim = `
    @keyframes swapA{0%,45%{opacity:1}55%,100%{opacity:0}}
    @keyframes swapB{0%,45%{opacity:0}55%,100%{opacity:1}}
    .swapA{animation:swapA ${duration}s ease-in-out infinite}
    .swapB{animation:swapB ${duration}s ease-in-out infinite}
  `;
  return (
    <svg viewBox="0 0 180 120" fill="none" style={{width:"100%",height:"100%",overflow:"visible"}}>
      <style>{anim}</style>
      <rect x="1" y="1" width="178" height="118" rx="16" fill="#141a2e" stroke="#2f375f"/>
      <line x1="16" y1="96" x2="164" y2="96" stroke={c} strokeWidth="1" strokeDasharray="5 5" opacity="0.18"/>
      {isStatic ? (
        <CharacterFigure gender={gender} pose={a} />
      ) : (
        <>
          <g className="swapA"><CharacterFigure gender={gender} pose={a} /></g>
          <g className="swapB"><CharacterFigure gender={gender} pose={b} /></g>
        </>
      )}
    </svg>
  );
};

export const ILLUS = {
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
};
