import React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { S } from "../theme/styles";
import type { UserProfile } from "../types";

interface OnboardingProps {
  onSave: (data: Omit<UserProfile, "id">) => void;
  onCancel?: (() => void) | null;
  initialData?: UserProfile | null;
  modeLabel?: string;
}

const onboardingSchema = z.object({
  name: z.string().min(2, "Escribe al menos 2 caracteres."),
  weight: z.coerce.number().min(30, "Introduce un peso entre 30 y 300 kg.").max(300, "Introduce un peso entre 30 y 300 kg."),
  height: z.coerce.number().min(120, "Introduce una altura entre 120 y 230 cm.").max(230, "Introduce una altura entre 120 y 230 cm."),
  waistCm: z.union([z.literal(""), z.coerce.number().min(50, "Si lo indicas, usa un rango entre 50 y 200 cm.").max(200, "Si lo indicas, usa un rango entre 50 y 200 cm.")]).optional().default(""),
  bodyFat: z.union([z.literal(""), z.coerce.number().min(3, "Si lo indicas, usa un rango entre 3% y 65%.").max(65, "Si lo indicas, usa un rango entre 3% y 65%.")]).optional().default(""),
  age: z.coerce.number().min(12, "Introduce una edad entre 12 y 100 anos.").max(100, "Introduce una edad entre 12 y 100 anos."),
  gender: z.enum(["masculino", "femenino"]),
  goal: z.enum(["fuerza", "cardio", "perdida", "tono"]),
  dietPreference: z.enum(["general", "vegana"]),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export function Onboarding({ onSave, onCancel, initialData, modeLabel }: OnboardingProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema) as Resolver<OnboardingFormData>,
    mode: "onChange",
    defaultValues: initialData
      ? { name: initialData.name, weight: initialData.weight as number, height: initialData.height as number, waistCm: initialData.waistCm as number | "" | undefined, bodyFat: initialData.bodyFat as number | "", age: initialData.age as number, gender: initialData.gender as "masculino" | "femenino", goal: initialData.goal as "fuerza" | "cardio" | "perdida" | "tono", dietPreference: initialData.dietPreference as "general" | "vegana" }
      : { name: "", weight: "" as unknown as number, height: "" as unknown as number, waistCm: "", bodyFat: "", age: "" as unknown as number, gender: "masculino", goal: "fuerza", dietPreference: "general" },
  });

  const form = watch();

  const onSubmit = (data: OnboardingFormData) => {
    onSave({
      ...data,
      waistCm: data.waistCm === "" ? "" : Number(data.waistCm),
      bodyFat: data.bodyFat === "" ? "" : Number(data.bodyFat),
    } as Omit<UserProfile, "id">);
  };

  const FIELD_ERR_STYLE = { color: "#ff8a8a", fontSize: 12, marginTop: 2 };

  return (
    <div style={{ ...S.container, paddingTop: 40 }}>
      {onCancel && (
        <button onClick={onCancel} style={{ background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:14, fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>
          {t("onboarding.back")}
        </button>
      )}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <h1 style={{ ...S.heading, fontSize:52, margin:0, color:S.accent, lineHeight:1 }}>IRON<br/>TRACK</h1>
        <p style={{ color:S.muted, margin:"12px 0 0", fontSize:14 }}>{t("onboarding.subtitle")}</p>
      </div>
      <div style={{ ...S.card, display:"flex", flexDirection:"column", gap:18 }}>
        <h2 style={{ ...S.heading, fontSize:22, margin:0 }}>{modeLabel || t("onboarding.aboutYou")}</h2>
        {([{ label:t("onboarding.nameLabel"), name:"name" as const, type:"text", placeholder:t("onboarding.namePlaceholder") },
          { label:t("onboarding.weightLabel"), name:"weight" as const, type:"number", placeholder:"70" },
          { label:t("onboarding.heightLabel"), name:"height" as const, type:"number", placeholder:"175" },
          { label:t("onboarding.waistLabel"), name:"waistCm" as const, type:"number", placeholder:"88" },
          { label:t("onboarding.bodyFatLabel"), name:"bodyFat" as const, type:"number", placeholder:"22" },
          { label:t("onboarding.ageLabel"), name:"age" as const, type:"number", placeholder:"25" }] as const).map(({ label, name, type, placeholder }) => (
          <label key={name} style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={S.fieldLabel}>{label}</span>
            <input type={type} placeholder={placeholder} {...register(name)}
              style={S.fieldInput}
              onFocus={e => e.target.style.borderColor = S.accent}
              onBlur={e => e.target.style.borderColor = "var(--input-border)"} />
            {errors[name] && <span style={FIELD_ERR_STYLE}>{errors[name]?.message}</span>}
          </label>
        ))}
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={S.fieldLabel}>{t("onboarding.sexLabel")}</span>
          <div style={{ display:"flex", gap:8 }}>
            {(["masculino", "femenino"] as const).map(g => (
              <button type="button" key={g} onClick={() => setValue("gender", g, { shouldValidate:true })}
                style={{ ...S.btn(form.gender === g ? S.accent : "var(--inactive-btn-bg)", form.gender === g ? "#080810" : "var(--text-main)"), flex:1, justifyContent:"center", border:`1px solid ${form.gender === g ? S.accent : "var(--border-main)"}` }}>
                {g === "masculino" ? t("onboarding.male") : t("onboarding.female")}
              </button>
            ))}
          </div>
        </label>
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={S.fieldLabel}>{t("onboarding.goalLabel")}</span>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {([["fuerza",t("onboarding.goalStrength")], ["cardio",t("onboarding.goalCardio")], ["perdida",t("onboarding.goalLoss")], ["tono",t("onboarding.goalTone")]] as const).map(([v, l]) => (
              <button type="button" key={v} onClick={() => setValue("goal", v, { shouldValidate:true })}
                style={{ ...S.btn(form.goal === v ? S.accent : "var(--inactive-btn-bg)", form.goal === v ? "#080810" : "var(--text-main)"), fontSize:13, padding:"10px 14px", border:`1px solid ${form.goal === v ? S.accent : "var(--border-main)"}` }}>
                {l}
              </button>
            ))}
          </div>
        </label>
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={S.fieldLabel}>{t("onboarding.dietLabel")}</span>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {([["general",t("onboarding.dietMixed")], ["vegana",t("onboarding.dietVegan")]] as const).map(([v, l]) => (
              <button type="button" key={v} onClick={() => setValue("dietPreference", v, { shouldValidate:true })}
                style={{ ...S.btn(form.dietPreference === v ? S.accent : "var(--inactive-btn-bg)", form.dietPreference === v ? "#080810" : "var(--text-main)"), fontSize:13, padding:"10px 14px", border:`1px solid ${form.dietPreference === v ? S.accent : "var(--border-main)"}` }}>
                {l}
              </button>
            ))}
          </div>
        </label>
        <button type="button" disabled={!isValid} onClick={handleSubmit(onSubmit)}
          style={{ ...S.btn(isValid ? S.accent : "var(--inactive-btn-bg)", isValid ? "#080810" : "var(--text-main)"), justifyContent:"center", fontSize:16, padding:18, marginTop:4, opacity:isValid ? 1 : 0.5 }}>
          {t("onboarding.save")}
        </button>
      </div>
    </div>
  );
}
