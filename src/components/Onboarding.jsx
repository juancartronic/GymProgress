import React, { useState, useEffect } from "react";
import { S } from "../theme/styles.js";

export function Onboarding({ onSave, onCancel, initialData, modeLabel }) {
  const [form, setForm] = useState(initialData || { name:"", weight:"", height:"", bodyFat:"", age:"", gender:"masculino", goal:"fuerza", dietPreference:"general" });
  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const parsed = {
    name: form.name.trim(),
    weight: Number(form.weight),
    height: Number(form.height),
    bodyFat: form.bodyFat === "" ? null : Number(form.bodyFat),
    age: Number(form.age),
  };

  const errors = {
    name: parsed.name.length < 2 ? "Escribe al menos 2 caracteres." : "",
    weight:
      !Number.isFinite(parsed.weight) || parsed.weight < 30 || parsed.weight > 300
        ? "Introduce un peso entre 30 y 300 kg."
        : "",
    height:
      !Number.isFinite(parsed.height) || parsed.height < 120 || parsed.height > 230
        ? "Introduce una altura entre 120 y 230 cm."
        : "",
    bodyFat:
      parsed.bodyFat !== null &&
      (!Number.isFinite(parsed.bodyFat) || parsed.bodyFat < 3 || parsed.bodyFat > 65)
        ? "Si lo indicas, usa un rango entre 3% y 65%."
        : "",
    age:
      !Number.isFinite(parsed.age) || parsed.age < 12 || parsed.age > 100
        ? "Introduce una edad entre 12 y 100 anos."
        : "",
  };

  const valid = Object.values(errors).every((msg) => !msg);

  const handleSave = () => {
    if (!valid) return;
    onSave({
      ...form,
      name: parsed.name,
      weight: parsed.weight,
      height: parsed.height,
      age: parsed.age,
      bodyFat: parsed.bodyFat === null ? "" : parsed.bodyFat,
    });
  };

  const FIELD_ERR_STYLE = { color: "#ff8a8a", fontSize: 12, marginTop: 2 };

  return (
    <div style={{ ...S.container, paddingTop: 40 }}>
      {onCancel && (
        <button onClick={onCancel} style={{ background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:14, fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>
          ← Volver
        </button>
      )}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <h1 style={{ ...S.heading, fontSize:52, margin:0, color:S.accent, lineHeight:1 }}>IRON<br/>TRACK</h1>
        <p style={{ color:S.muted, margin:"12px 0 0", fontSize:14 }}>Tu entrenamiento. Tu progreso.</p>
      </div>
      <div style={{ ...S.card, display:"flex", flexDirection:"column", gap:18 }}>
        <h2 style={{ ...S.heading, fontSize:22, margin:0 }}>{modeLabel || "Cuentanos sobre ti"}</h2>
        {[{ label:"Nombre", key:"name", type:"text", placeholder:"Como te llamas?" },
          { label:"Peso (kg)", key:"weight", type:"number", placeholder:"70" },
          { label:"Altura (cm)", key:"height", type:"number", placeholder:"175" },
          { label:"Grasa corporal (%)", key:"bodyFat", type:"number", placeholder:"22" },
          { label:"Edad", key:"age", type:"number", placeholder:"25" }].map(({ label, key, type, placeholder }) => (
          <label key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={S.fieldLabel}>{label}</span>
            <input type={type} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)}
              style={S.fieldInput}
              onFocus={e => e.target.style.borderColor = S.accent}
              onBlur={e => e.target.style.borderColor = "var(--input-border)"} />
            {errors[key] && <span style={FIELD_ERR_STYLE}>{errors[key]}</span>}
          </label>
        ))}
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={S.fieldLabel}>Sexo biologico</span>
          <div style={{ display:"flex", gap:8 }}>
            {["masculino", "femenino"].map(g => (
              <button key={g} onClick={() => set("gender", g)}
                style={{ ...S.btn(form.gender === g ? S.accent : "var(--inactive-btn-bg)", form.gender === g ? "#080810" : "var(--text-main)"), flex:1, justifyContent:"center", border:`1px solid ${form.gender === g ? S.accent : "var(--border-main)"}` }}>
                {g === "masculino" ? "Masculino" : "Femenino"}
              </button>
            ))}
          </div>
        </label>
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={S.fieldLabel}>Objetivo principal</span>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["fuerza","Fuerza"], ["cardio","Cardio"], ["perdida","Perder peso"], ["tono","Tonificar"]].map(([v, l]) => (
              <button key={v} onClick={() => set("goal", v)}
                style={{ ...S.btn(form.goal === v ? S.accent : "var(--inactive-btn-bg)", form.goal === v ? "#080810" : "var(--text-main)"), fontSize:13, padding:"10px 14px", border:`1px solid ${form.goal === v ? S.accent : "var(--border-main)"}` }}>
                {l}
              </button>
            ))}
          </div>
        </label>
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={S.fieldLabel}>Preferencia alimentaria</span>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["general","Mixta"], ["vegana","Vegana"]].map(([v, l]) => (
              <button key={v} onClick={() => set("dietPreference", v)}
                style={{ ...S.btn(form.dietPreference === v ? S.accent : "var(--inactive-btn-bg)", form.dietPreference === v ? "#080810" : "var(--text-main)"), fontSize:13, padding:"10px 14px", border:`1px solid ${form.dietPreference === v ? S.accent : "var(--border-main)"}` }}>
                {l}
              </button>
            ))}
          </div>
        </label>
        <button disabled={!valid} onClick={handleSave}
          style={{ ...S.btn(valid ? S.accent : "var(--inactive-btn-bg)", valid ? "#080810" : "var(--text-main)"), justifyContent:"center", fontSize:16, padding:18, marginTop:4, opacity:valid ? 1 : 0.5 }}>
          Guardar perfil
        </button>
      </div>
    </div>
  );
}
