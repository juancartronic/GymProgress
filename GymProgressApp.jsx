import React, { useState, useEffect } from "react";
import { NavBar } from "./src/components/NavBar.jsx";
import { DAY_STATE_ORDER, defaultWeeklyCalendar } from "./src/domain/data.js";
import { loadAppState, saveAppState } from "./src/storage/appStorage.js";
import { ensureAppFonts } from "./src/theme/fonts.js";
import { S, APP_GLOBAL_CSS } from "./src/theme/styles.js";
import { THEMES } from "./src/theme/tokens.js";
import { Onboarding } from "./src/components/Onboarding.jsx";
import { Dashboard } from "./src/components/Dashboard.jsx";
import { PlansView } from "./src/components/PlansView.jsx";
import { WorkoutDemo } from "./src/components/WorkoutDemo.jsx";
import { ActiveWorkout } from "./src/components/ActiveWorkout.jsx";
import { Summary } from "./src/components/Summary.jsx";
import { History } from "./src/components/History.jsx";

ensureAppFonts();


export default function App(){
  const[profiles,setProfiles]=useState([]);
  const[activeProfileId,setActiveProfileId]=useState(null);
  const[historyByProfile,setHistoryByProfile]=useState({});
  const[weeklyCalendarByProfile,setWeeklyCalendarByProfile]=useState({});
  const[customExercisesByProfile,setCustomExercisesByProfile]=useState({});
  const[screen,setScreen]=useState("onboarding");
  const[activeWorkout,setActiveWorkout]=useState(null);
  const[workoutResult,setWorkoutResult]=useState(null);
  const[loaded,setLoaded]=useState(false);
  const[editingProfileId,setEditingProfileId]=useState(null);
  const[themeMode,setThemeMode]=useState("dark");

  const theme=THEMES[themeMode] || THEMES.dark;

  const user=profiles.find(p=>p.id===activeProfileId)||null;
  const history=user?(historyByProfile[user.id]||[]):[];
  const weeklyCalendar=user?(weeklyCalendarByProfile[user.id]||defaultWeeklyCalendar()):defaultWeeklyCalendar();
  const savedExtraIds=user?(customExercisesByProfile[user.id]||[]):[];

  const prepWorkout=(w,l,origin)=>{
    setActiveWorkout({workout:w,planLevel:l,origin,difficulty:"normal"});
    setScreen("demo");
  };

  useEffect(()=>{
    (async()=>{
      const state=await loadAppState();
      if(state){
        setProfiles(state.profiles);
        setActiveProfileId(state.activeProfileId);
        setHistoryByProfile(state.historyByProfile);
        setWeeklyCalendarByProfile(state.weeklyCalendarByProfile);
        setCustomExercisesByProfile(state.customExercisesByProfile||{});
        setThemeMode(state.themeMode);
      }
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{
    if(!loaded)return;
    saveAppState({ profiles, activeProfileId, historyByProfile, weeklyCalendarByProfile, customExercisesByProfile, themeMode });
    if(user&&screen==="onboarding")setScreen("dashboard");
  },[profiles,activeProfileId,historyByProfile,weeklyCalendarByProfile,customExercisesByProfile,themeMode,loaded,user,screen]);

  if(!loaded)return(
    <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...S.heading,fontSize:48,color:S.accent,textAlign:"center"}}>IRON<br/>TRACK</div>
    </div>
  );

  return(
    <div
      style={{
        ...S.app,
        "--bg-main": theme.bgMain,
        "--text-main": theme.textMain,
        "--text-muted": theme.textMuted,
        "--card-bg": theme.cardBg,
        "--border-main": theme.border,
        "--input-bg": theme.inputBg,
        "--input-border": theme.inputBorder,
        "--nav-bg": theme.navBg,
        "--surface-soft": theme.surfaceSoft,
        "--surface-inner": theme.surfaceInner,
        "--scroll-track": theme.scrollTrack,
        "--scroll-thumb": theme.scrollThumb,
        "--card-plan-bg": theme.cardPlanBg,
        "--card-obj-bg": theme.cardObjBg,
        "--card-nut-bg": theme.cardNutBg,
        "--card-cal-bg": theme.cardCalBg,
        "--card-diet-bg": theme.cardDietBg,
        "--card-demo-bg": theme.cardDemoBg,
        "--inactive-btn-bg": theme.inactiveBtnBg,
        "--tip-card-bg": theme.tipCardBg,
        "--tip-card-border": theme.tipCardBorder,
        "--sound-on-bg": theme.soundOnBg,
        "--vibrate-on-bg": theme.vibrateOnBg,
      }}
    >
      <style>{APP_GLOBAL_CSS}</style>
      <button
        onClick={()=>setThemeMode(t=>t==="dark"?"light":"dark")}
        aria-label={themeMode==="dark"?"Cambiar a modo dia":"Cambiar a modo noche"}
        title={themeMode==="dark"?"Modo dia":"Modo noche"}
        style={{
          position:"fixed",
          top:10,
          right:10,
          zIndex:120,
          width:46,
          height:26,
          borderRadius:999,
          border:`1px solid ${theme.border}`,
          background:themeMode==="dark"?"#1c1f2e":"#e9eef7",
          cursor:"pointer",
          padding:2,
          display:"flex",
          alignItems:"center",
          justifyContent:themeMode==="dark"?"flex-end":"flex-start",
          transition:"all .18s ease",
        }}
      >
        <span
          style={{
            width:20,
            height:20,
            borderRadius:"50%",
            background:themeMode==="dark"?"#f3f6fb":"#111827",
            color:themeMode==="dark"?"#111827":"#f3f6fb",
            display:"inline-flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:11,
            lineHeight:1,
            transition:"all .18s ease",
          }}
        >
          {themeMode==="dark"?"☀":"☾"}
        </span>
      </button>
      {(screen==="onboarding"||screen==="profile-form")&&(
        <Onboarding
          initialData={editingProfileId?profiles.find(p=>p.id===editingProfileId):null}
          modeLabel={editingProfileId?"Editar perfil":"Crear perfil"}
          onCancel={screen==="profile-form"?()=>setScreen("dashboard"):null}
          onSave={d=>{
            if(editingProfileId){
              setProfiles(ps=>ps.map(p=>p.id===editingProfileId?{...p,...d,id:p.id}:p));
              setEditingProfileId(null);
              setScreen("dashboard");
            }else{
              const id=`p-${Date.now()}`;
              const profile={...d,id};
              setProfiles(ps=>[...ps,profile]);
              setActiveProfileId(id);
              setHistoryByProfile(h=>({...h,[id]:[]}));
              setWeeklyCalendarByProfile(w=>({...w,[id]:defaultWeeklyCalendar()}));
              setCustomExercisesByProfile(c=>({...c,[id]:[]}));
              setScreen("dashboard");
            }
          }}
        />
      )}
      {screen==="dashboard"&&user&&(
        <Dashboard
          user={user}
          history={history}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSwitchProfile={(id)=>setActiveProfileId(id)}
          onAddProfile={()=>{setEditingProfileId(null);setScreen("profile-form");}}
          onEditProfile={()=>{setEditingProfileId(activeProfileId);setScreen("profile-form");}}
          onDeleteProfile={()=>{
            if(!user)return;
            const ok=window.confirm(`┬┐Eliminar el perfil ${user.name}? Esta accion borrara su historial y calendario.`);
            if(!ok)return;

            const remaining=profiles.filter(p=>p.id!==user.id);
            setProfiles(remaining);
            setHistoryByProfile(prev=>{
              const next={...prev};
              delete next[user.id];
              return next;
            });
            setWeeklyCalendarByProfile(prev=>{
              const next={...prev};
              delete next[user.id];
              return next;
            });
            setCustomExercisesByProfile(prev=>{
              const next={...prev};
              delete next[user.id];
              return next;
            });

            if(remaining.length>0){
              setActiveProfileId(remaining[0].id);
              setScreen("dashboard");
            }else{
              setActiveProfileId(null);
              setScreen("onboarding");
            }
          }}
          weeklyCalendar={weeklyCalendar}
          onCycleDayState={(dayKey)=>{
            setWeeklyCalendarByProfile(prev=>{
              const curr=prev[user.id]||defaultWeeklyCalendar();
              const currentState=curr[dayKey]||"descanso";
              const idx=DAY_STATE_ORDER.indexOf(currentState);
              const next=DAY_STATE_ORDER[(idx+1)%DAY_STATE_ORDER.length];
              return {
                ...prev,
                [user.id]:{...curr,[dayKey]:next}
              };
            });
          }}
          onStartWorkout={(w,l)=>prepWorkout(w,l,"dashboard")}
          savedExtraIds={savedExtraIds}
          onRemoveSavedExtra={(id)=>{
            if(!user)return;
            setCustomExercisesByProfile(prev=>({
              ...prev,
              [user.id]:(prev[user.id]||[]).filter((x)=>x!==id),
            }));
          }}
          onClearSavedExtras={()=>{
            if(!user)return;
            setCustomExercisesByProfile(prev=>({
              ...prev,
              [user.id]:[],
            }));
          }}
          themeMode={themeMode}
        />
      )}
      {screen==="plans"&&<PlansView user={user} themeMode={themeMode} onStartWorkout={(w,l)=>prepWorkout(w,l,"plans")}/>} 
      {screen==="history"&&<History history={history} user={user}/>}
      {screen==="demo"&&activeWorkout&&(
        <WorkoutDemo
          workout={activeWorkout.workout}
          planLevel={activeWorkout.planLevel}
          savedExtraIds={savedExtraIds}
          onSaveExtraIds={(ids)=>{
            if(!user)return;
            setCustomExercisesByProfile(prev=>({
              ...prev,
              [user.id]:ids,
            }));
          }}
          user={user}
          onStartNow={(customWorkout)=>{
            if(customWorkout){
              setActiveWorkout(prev=>prev?{...prev,workout:customWorkout}:prev);
            }
            setScreen("active");
          }}
          onBack={()=>setScreen(activeWorkout.origin||"dashboard")}
        />
      )}
      {screen==="active"&&activeWorkout&&(
        <ActiveWorkout workout={activeWorkout.workout} user={user} planLevel={activeWorkout.planLevel} initialDifficulty={activeWorkout.difficulty}
          onFinish={r=>{
            setWorkoutResult(r);
            setHistoryByProfile(h=>({
              ...h,
              [user.id]:[...(h[user.id]||[]),r]
            }));
            setScreen("summary");
          }}
          onCancel={()=>setScreen(activeWorkout.origin||"dashboard")}/>
      )}
      {screen==="summary"&&workoutResult&&(
        <Summary result={workoutResult} user={user} onContinue={()=>setScreen("dashboard")}/>
      )}
      <NavBar screen={screen} setScreen={setScreen} hasUser={!!user} accent={S.accent} muted={S.muted} />
    </div>
  );
}
