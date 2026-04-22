import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import { EXDB, EX_TIPS, DIFFICULTY, translateExerciseName, translateExerciseMuscle } from "../domain/data";
import { scaleWorkout, applyProfessionalProgression, calcCalories, fmtTime } from "../domain/workout";
import { ILLUS } from "./Illustrations";
import { ProgressBar } from "./ProgressBar";
import type { Workout, WorkoutResult, UserProfile, DifficultyKey } from "../types";

interface ActiveWorkoutProps {
  workout: Workout;
  user: UserProfile;
  planLevel: number;
  initialDifficulty?: DifficultyKey;
  onFinish: (result: WorkoutResult) => void;
  onCancel: () => void;
}

export function ActiveWorkout({ workout, user, planLevel, initialDifficulty = "normal", onFinish, onCancel }: ActiveWorkoutProps) {
  const { t, i18n } = useTranslation();
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState<"exercise" | "rest">("exercise");
  const [timer, setTimer] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyKey>(initialDifficulty);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrateOn, setVibrateOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [listenOn, setListenOn] = useState(false);
  const listenOnRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const handleVoiceCmdRef = useRef<((text: string) => void) | null>(null);
  const startTime = useRef(Date.now());
  const iRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const workoutScaled = useMemo(() => {
    const base = scaleWorkout(workout, difficulty);
    return applyProfessionalProgression(base, planLevel, user);
  }, [workout, difficulty, planLevel, user]);

  const ex = workoutScaled.exercises[exIdx];
  const info = EXDB[ex?.id];
  const Illus = ex ? ILLUS[ex.id] : null;
  const totalSets = workoutScaled.exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = done.reduce((s, d) => s + d, 0);
  const lockDifficulty = exIdx > 0 || setIdx > 0 || doneSets > 0 || phase === "rest";

  const feedback = useCallback((kind: "tick" | "rest" | "go") => {
    if (soundOn) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
          if (!audioRef.current) audioRef.current = new Ctx();
          const ctx = audioRef.current;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const f = kind === "tick" ? 880 : kind === "rest" ? 520 : 660;
          o.type = "sine";
          o.frequency.value = f;
          g.gain.value = 0.0001;
          o.connect(g);
          g.connect(ctx.destination);
          const now = ctx.currentTime;
          g.gain.exponentialRampToValueAtTime(0.09, now + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
          o.start(now);
          o.stop(now + 0.13);
        }
      } catch {}
    }
    if (vibrateOn && navigator.vibrate) {
      if (kind === "rest") navigator.vibrate([50, 50, 50]);
      else navigator.vibrate(40);
    }
  }, [soundOn, vibrateOn]);

  const speak = useCallback((text: string) => {
    if (!voiceOn) return;
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === "en" ? "en-US" : "es-ES";
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, [voiceOn, i18n.language]);

  // Actualiza el handler de comandos en cada render para tener closures frescas
  useEffect(() => {
    handleVoiceCmdRef.current = (text: string) => {
      const t = text.toLowerCase().trim();
      if (phase === "exercise") {
        if (t.includes("siguiente") || t.includes("listo") || t.includes("completado")) startRest();
      } else if (phase === "rest") {
        if (t.includes("saltar") || t.includes("siguiente") || t.includes("listo")) { if (iRef.current) clearInterval(iRef.current); nextSet(); }
      }
    };
  });

  useEffect(() => {
    listenOnRef.current = listenOn;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!listenOn || !SR) { try { recognitionRef.current?.stop(); } catch {} recognitionRef.current = null; return; }
    const rec = new SR();
    rec.lang = i18n.language === "en" ? "en-US" : "es-ES"; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const last = ev.results[ev.results.length - 1][0].transcript;
      handleVoiceCmdRef.current?.(last);
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") setListenOn(false); };
    rec.onend = () => { if (listenOnRef.current) { try { rec.start(); } catch {} } };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
    return () => { try { rec.stop(); } catch {}; };
  }, [listenOn]);

  const nextSet = useCallback(() => {
    if (iRef.current) clearInterval(iRef.current);
    feedback("go");
    if (setIdx + 1 < ex.sets) { setSetIdx(s => s + 1); setPhase("exercise"); }
    else {
      setDone(d => [...d, ex.sets]);
      if (exIdx + 1 < workoutScaled.exercises.length) { setExIdx(i => i + 1); setSetIdx(0); setPhase("exercise"); }
      else {
        const minutes = Math.max(1, Math.floor((Date.now() - startTime.current) / 60000));
        speak(t("activeWorkout.workoutDone"));
        onFinish({
          workout: workoutScaled,
          baseWorkout: workout,
          planLevel,
          difficulty,
          duration: minutes,
          calories: calcCalories(workoutScaled.exercises, user, minutes),
          date: new Date().toISOString(),
        });
      }
    }
  }, [difficulty, ex, setIdx, exIdx, workoutScaled, user, planLevel, onFinish, workout, feedback, speak]);

  useEffect(() => {
    iRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      if (phase === "rest") setTimer(t => {
        if (t <= 1) { if (iRef.current) clearInterval(iRef.current); nextSet(); return 0; }
        const nt = t - 1;
        if (nt <= 3 && nt > 0) feedback("tick");
        return nt;
      });
    }, 1000);
    return () => { if (iRef.current) clearInterval(iRef.current); };
  }, [phase, exIdx, setIdx, nextSet, feedback]);

  useEffect(() => () => {
    try { window.speechSynthesis?.cancel(); } catch {}
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  useEffect(() => {
    if (!ex || phase !== "exercise") return;
    const unit = ex.isTime ? t("activeWorkout.seconds") : t("activeWorkout.reps");
    const cue = EX_TIPS[ex.id]?.cue ? ` ${t("activeWorkout.tip")}: ${EX_TIPS[ex.id].cue}` : "";
    speak(`${EXDB[ex.id]?.name || t("activeWorkout.exercise")}. ${t("activeWorkout.set")} ${setIdx+1} ${t("activeWorkout.of")} ${ex.sets}. ${ex.reps} ${unit}.${cue}`);
  }, [ex, phase, setIdx, speak]);

  const startRest = () => {
    if (iRef.current) clearInterval(iRef.current);
    setPhase("rest");
    setTimer(ex.rest);
    feedback("rest");
    speak(`${t("activeWorkout.rest")} ${ex.rest} ${t("activeWorkout.seconds")}.`);
  };

  if (!ex) return null;

  return (
    <div style={{ ...S.container, paddingTop:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <button onClick={onCancel} style={{ background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>✕ {t("activeWorkout.cancel")}</button>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, color:S.muted }}>{fmtTime(elapsed)}</div>
      </div>
      <div style={{ ...S.card, padding:"12px", marginBottom:12, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:11, color:S.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{t("activeWorkout.difficultyLabel")}</span>
          <span style={{ fontSize:11, color:lockDifficulty ? S.orange : S.muted }}>{lockDifficulty ? t("activeWorkout.difficultyLocked") : t("activeWorkout.difficultyEditable")}</span>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {(Object.entries(DIFFICULTY) as [DifficultyKey, { label: string }][]).map(([k, v]) => (
            <button key={k} disabled={lockDifficulty} onClick={() => setDifficulty(k)}
              style={{ ...S.btn(difficulty === k ? S.accent : "var(--inactive-btn-bg)", difficulty === k ? "#080810" : "var(--text-muted)"), padding:"8px 12px", fontSize:12, border:`1px solid ${difficulty === k ? S.accent : "var(--border-main)"}`, opacity:lockDifficulty && difficulty !== k ? 0.5 : 1 }}>
              {v.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={() => setSoundOn(v => !v)} style={{ ...S.btn(soundOn ? "var(--sound-on-bg)" : "var(--inactive-btn-bg)", soundOn ? S.accent : "var(--text-muted)"), padding:"8px 12px", fontSize:12, border:"1px solid var(--border-main)" }}>{soundOn ? t("activeWorkout.soundOn") : t("activeWorkout.soundOff")}</button>
          <button onClick={() => setVibrateOn(v => !v)} style={{ ...S.btn(vibrateOn ? "var(--vibrate-on-bg)" : "var(--inactive-btn-bg)", vibrateOn ? "#ffb266" : "var(--text-muted)"), padding:"8px 12px", fontSize:12, border:"1px solid var(--border-main)" }}>{vibrateOn ? t("activeWorkout.vibrateOn") : t("activeWorkout.vibrateOff")}</button>
          <button onClick={() => setVoiceOn(v => !v)} style={{ ...S.btn(voiceOn ? "#2a2f4a" : "var(--inactive-btn-bg)", voiceOn ? "#bcd3ff" : "var(--text-muted)"), padding:"8px 12px", fontSize:12, border:"1px solid var(--border-main)" }}>{voiceOn ? t("activeWorkout.voiceOn") : t("activeWorkout.voiceOff")}</button>
          {(window.SpeechRecognition || window.webkitSpeechRecognition) && <button onClick={() => setListenOn(v => !v)} style={{ ...S.btn(listenOn ? "#1a3a2a" : "var(--inactive-btn-bg)", listenOn ? "#7de8b8" : "var(--text-muted)"), padding:"8px 12px", fontSize:12, border:`1px solid ${listenOn ? "#7de8b8" : "var(--border-main)"}` }}>{listenOn ? t("activeWorkout.freeHandsOn") : t("activeWorkout.freeHandsOff")}</button>}
        </div>
      </div>
      <ProgressBar value={(doneSets / totalSets) * 100} max={100} height={4} />
      <div style={{ display:"flex", justifyContent:"space-between", margin:"6px 0 12px", fontSize:11, color:S.muted }}>
        <span>{t("activeWorkout.exercise")} {exIdx+1} / {workoutScaled.exercises.length}</span>
        <span>{Math.round((doneSets / totalSets) * 100)}% {t("activeWorkout.completed")}</span>
      </div>
      {listenOn && <div style={{ textAlign:"center", fontSize:11, color:"#7de8b8", marginBottom:12, letterSpacing:"0.06em" }}>🎤 {t("activeWorkout.handsActive")}</div>}
      {phase === "exercise" ? (
        <>
          <div style={{ background:"var(--surface-soft)", borderRadius:20, padding:24, marginBottom:20, display:"flex", justifyContent:"center", height:210, alignItems:"center", overflow:"hidden" }}>
            {Illus ? Illus(S.accent, user?.gender || "masculino") : <div style={{ fontSize:60 }}>...</div>}
          </div>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <span style={S.pill(info.tag === "HIIT" ? S.orange : S.accent)}>{info.tag}</span>
            <h2 style={{ ...S.heading, fontSize:38, margin:"10px 0 4px" }}>{translateExerciseName(ex.id, i18n.language).toUpperCase()}</h2>
            <p style={{ color:S.muted, margin:"0 0 20px", fontSize:13 }}>{translateExerciseMuscle(ex.id, i18n.language)}</p>
            <div style={{ ...S.card, padding:"12px 14px", margin:"0 auto 20px", maxWidth:420, textAlign:"left", background:"var(--tip-card-bg)", border:"1px solid var(--tip-card-border)" }}>
              <div style={{ fontSize:11, color:S.accent, marginBottom:4, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{t("activeWorkout.tip")}</div>
              <div style={{ fontSize:13, marginBottom:4 }}>• {EX_TIPS[ex.id]?.cue}</div>
              <div style={{ fontSize:12, color:S.muted }}>{t("activeWorkout.avoid")} {EX_TIPS[ex.id]?.mistake}</div>
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <div style={{ ...S.card, padding:"16px 28px", textAlign:"center" }}>
                <div style={{ ...S.heading, fontSize:40, color:S.accent, lineHeight:1 }}>{ex.reps}</div>
                <div style={{ fontSize:12, color:S.muted }}>{ex.isTime ? t("activeWorkout.seconds") : t("activeWorkout.reps")}</div>
              </div>
              <div style={{ ...S.card, padding:"16px 28px", textAlign:"center" }}>
                <div style={{ ...S.heading, fontSize:40, lineHeight:1 }}>{setIdx+1}<span style={{ fontSize:22, color:S.muted }}>/{ex.sets}</span></div>
                <div style={{ fontSize:12, color:S.muted }}>{t("activeWorkout.set")}</div>
              </div>
            </div>
            {ex.loadKg ? (
              <p style={{ margin:"12px 0 0", fontSize:12, color:"#9ecfff" }}>{t("activeWorkout.load")} {ex.loadKg} kg.</p>
            ) : null}
          </div>
          <button onClick={startRest} style={{ ...S.btn(S.accent), width:"100%", justifyContent:"center", fontSize:17, padding:18 }}>
            {t("activeWorkout.setDone")}
          </button>
        </>
      ) : (
        <div style={{ textAlign:"center", paddingTop:20 }}>
          <div style={{ ...S.card, marginBottom:24, padding:40 }}>
            <p style={{ color:S.muted, margin:"0 0 8px", fontSize:13, textTransform:"uppercase", letterSpacing:"0.1em" }}>{t("activeWorkout.rest")}</p>
            <div style={{ ...S.heading, fontSize:88, color:S.orange, lineHeight:1, marginBottom:12 }}>{timer}</div>
            <p style={{ color:S.muted, margin:0, fontSize:13 }}>{t("activeWorkout.secondsLeft")}</p>
            <div style={{ marginTop:20 }}><ProgressBar value={ex.rest - timer} max={ex.rest} color={S.orange} height={8} /></div>
          </div>
          {setIdx + 1 < ex.sets
            ? <p style={{ color:S.muted, fontSize:14 }}>{t("activeWorkout.nextSet")}: <strong style={{ color:"#f0f0f0" }}>{t("activeWorkout.set")} {setIdx+2} {t("activeWorkout.of")} {ex.sets}</strong></p>
            : exIdx + 1 < workoutScaled.exercises.length
              ? <p style={{ color:S.muted, fontSize:14 }}>{t("activeWorkout.nextExercise")}: <strong style={{ color:S.accent }}>{translateExerciseName(workoutScaled.exercises[exIdx+1].id, i18n.language)}</strong></p>
              : <p style={{ color:S.accent, fontSize:14, fontWeight:600 }}>{t("activeWorkout.lastDone")}</p>
          }
          <button onClick={() => { if (iRef.current) clearInterval(iRef.current); nextSet(); }} style={{ ...S.btn("#1e1e2e", S.muted), marginTop:16, justifyContent:"center" }}>
            {t("activeWorkout.skipRest")}
          </button>
        </div>
      )}
    </div>
  );
}
