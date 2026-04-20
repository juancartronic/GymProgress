import React, { useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { NavBar } from "./src/components/NavBar";
import { DAY_STATE_ORDER, defaultWeeklyCalendar } from "./src/domain/data";
import { loadAppState, saveAppState } from "./src/storage/appStorage";
import { ensureAppFonts } from "./src/theme/fonts";
import { S, APP_GLOBAL_CSS } from "./src/theme/styles";
import { THEMES } from "./src/theme/tokens";
import { Onboarding } from "./src/components/Onboarding";
import { Dashboard } from "./src/components/Dashboard";
import { PlansView } from "./src/components/PlansView";
import { WorkoutDemo } from "./src/components/WorkoutDemo";
import { ActiveWorkout } from "./src/components/ActiveWorkout";
import { Summary } from "./src/components/Summary";
import { History } from "./src/components/History";
import { PageTransition } from "./src/components/PageTransition";
import { DashboardSkeleton } from "./src/components/Skeleton";
import { AnimatePresence } from "framer-motion";
import { useAppState, useAppDispatch } from "./src/state/AppContext";
import type { UserProfile, Workout, AppState } from "./src/types";

ensureAppFonts();


export default function App(){
  const navigate = useNavigate();
  const location = useLocation();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { profiles, activeProfileId, historyByProfile, weeklyCalendarByProfile, customExercisesByProfile, weightLogByProfile, activeWorkout, workoutResult, loaded, editingProfileId, themeMode } = state;

  const theme=THEMES[themeMode] || THEMES.dark;

  const user=profiles.find(p=>p.id===activeProfileId)||null;
  const history=user?(historyByProfile[user.id]||[]):[];
  const weeklyCalendar=user?(weeklyCalendarByProfile[user.id]||defaultWeeklyCalendar()):defaultWeeklyCalendar();
  const savedExtraIds=user?(customExercisesByProfile[user.id]||[]):[];

  const prepWorkout=useCallback((w: Workout,l: number,origin: string)=>{
    dispatch({type:"PREP_WORKOUT",payload:{workout:w,planLevel:l,origin,difficulty:"normal"}});
    navigate("/demo");
  },[navigate,dispatch]);

  useEffect(()=>{
    (async()=>{
      const loaded=await loadAppState();
      if(loaded){
        dispatch({type:"LOAD_STATE",payload:loaded});
      }else{
        dispatch({type:"SET_LOADED"});
      }
    })();
  },[dispatch]);

  useEffect(()=>{
    if(!loaded)return;
    const result = saveAppState({ profiles, activeProfileId, historyByProfile, weeklyCalendarByProfile, customExercisesByProfile, weightLogByProfile, themeMode });
    if(!result.ok && result.error) toast.error(result.error);
    if(user&&location.pathname==="/onboarding") navigate("/dashboard",{replace:true});
  },[profiles,activeProfileId,historyByProfile,weeklyCalendarByProfile,customExercisesByProfile,weightLogByProfile,themeMode,loaded,user,location.pathname,navigate]);

  if(!loaded)return(
    <div style={{...S.app,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start"} as React.CSSProperties}>
      <div style={{...S.heading,fontSize:48,color:S.accent,textAlign:"center",marginTop:40,marginBottom:20} as React.CSSProperties}>IRON<br/>TRACK</div>
      <div style={{width:"100%",maxWidth:420}}>
        <DashboardSkeleton />
      </div>
    </div>
  );

  const rootStyle: Record<string, string> = {
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
  };

  return(
    <div
      style={{
        ...S.app,
        ...rootStyle,
      } as React.CSSProperties}
    >
      <style>{APP_GLOBAL_CSS}</style>
      <Toaster position="top-center" toastOptions={{style:{background:"#1e1e2e",color:"#f0f0f0",borderRadius:12,fontSize:14}}} />
      <button
        onClick={()=>dispatch({type:"TOGGLE_THEME"})}
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
      {/* Route-based screens */}
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/onboarding" element={
          <PageTransition>
          <Onboarding
            initialData={editingProfileId?profiles.find(p=>p.id===editingProfileId)??null:null}
            modeLabel={editingProfileId?"Editar perfil":"Crear perfil"}
            onCancel={null}
            onSave={d=>{
              if(editingProfileId){
                dispatch({type:"UPDATE_PROFILE",payload:{id:editingProfileId,data:d as Omit<UserProfile,"id">}});
                toast.success("Perfil actualizado");
                navigate("/dashboard");
              }else{
                const id=`p-${Date.now()}`;
                dispatch({type:"ADD_PROFILE",payload:{...d,id} as UserProfile});
                toast.success("Perfil creado");
                navigate("/dashboard");
              }
            }}
          />
          </PageTransition>
        }/>
        <Route path="/profile" element={
          <PageTransition>
          <Onboarding
            initialData={editingProfileId?profiles.find(p=>p.id===editingProfileId)??null:null}
            modeLabel={editingProfileId?"Editar perfil":"Crear perfil"}
            onCancel={()=>navigate("/dashboard")}
            onSave={d=>{
              if(editingProfileId){
                dispatch({type:"UPDATE_PROFILE",payload:{id:editingProfileId,data:d as Omit<UserProfile,"id">}});
                toast.success("Perfil actualizado");
                navigate("/dashboard");
              }else{
                const id=`p-${Date.now()}`;
                dispatch({type:"ADD_PROFILE",payload:{...d,id} as UserProfile});
                toast.success("Perfil creado");
                navigate("/dashboard");
              }
            }}
          />
          </PageTransition>
        }/>
        <Route path="/dashboard" element={
          user ? (
            <PageTransition>
            <Dashboard
              user={user}
              history={history}
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSwitchProfile={(id)=>dispatch({type:"SWITCH_PROFILE",payload:id})}
              onAddProfile={()=>{dispatch({type:"SET_EDITING_PROFILE",payload:null});navigate("/profile");}}
              onEditProfile={()=>{dispatch({type:"SET_EDITING_PROFILE",payload:activeProfileId});navigate("/profile");}}
              onDeleteProfile={()=>{
                if(!user)return;
                const ok=window.confirm(`¿Eliminar el perfil ${user.name}? Esta accion borrara su historial y calendario.`);
                if(!ok)return;
                dispatch({type:"DELETE_PROFILE",payload:user.id});
                toast.success("Perfil eliminado");
                if(profiles.filter(p=>p.id!==user.id).length===0) navigate("/onboarding");
              }}
              weeklyCalendar={weeklyCalendar}
              onCycleDayState={(dayKey)=>{
                const curr=weeklyCalendarByProfile[user.id]||defaultWeeklyCalendar();
                const currentState=(curr as Record<string,string>)[dayKey]||"descanso";
                const idx=DAY_STATE_ORDER.indexOf(currentState as any);
                const nextState=DAY_STATE_ORDER[(idx+1)%DAY_STATE_ORDER.length];
                dispatch({type:"CYCLE_DAY_STATE",payload:{userId:user.id,dayKey,nextState}});
              }}
              onStartWorkout={(w,l)=>prepWorkout(w,l,"/dashboard")}
              savedExtraIds={savedExtraIds}
              onRemoveSavedExtra={(id)=>{
                if(!user)return;
                dispatch({type:"REMOVE_SAVED_EXTRA",payload:{userId:user.id,id}});
              }}
              onClearSavedExtras={()=>{
                if(!user)return;
                dispatch({type:"CLEAR_SAVED_EXTRAS",payload:user.id});
              }}
              themeMode={themeMode}
              onImportData={(s)=>dispatch({type:"IMPORT_STATE",payload:s})}
              weightLog={user ? (weightLogByProfile[user.id] || []) : []}
              onLogWeight={(w)=>{
                if(!user)return;
                dispatch({type:"LOG_WEIGHT",payload:{userId:user.id,entry:{date:new Date().toISOString().slice(0,10),weight:w}}});
                toast.success(`Peso actualizado: ${w} kg`);
              }}
            />
            </PageTransition>
          ) : <Navigate to="/onboarding" replace />
        }/>
        <Route path="/plans" element={
          user ? <PageTransition><PlansView user={user} themeMode={themeMode} onStartWorkout={(w,l)=>prepWorkout(w,l,"/plans")}/></PageTransition> : <Navigate to="/onboarding" replace />
        }/>
        <Route path="/history" element={
          user ? <PageTransition><History history={history} user={user}/></PageTransition> : <Navigate to="/onboarding" replace />
        }/>
        <Route path="/demo" element={
          activeWorkout ? (
            <PageTransition>
            <WorkoutDemo
              workout={activeWorkout.workout}
              planLevel={activeWorkout.planLevel}
              savedExtraIds={savedExtraIds}
              onSaveExtraIds={(ids)=>{
                if(!user)return;
                dispatch({type:"SAVE_EXTRA_IDS",payload:{userId:user.id,ids}});
              }}
              user={user!}
              onStartNow={(customWorkout)=>{
                if(customWorkout&&activeWorkout){
                  dispatch({type:"UPDATE_ACTIVE_WORKOUT_EXERCISES",payload:{...activeWorkout,workout:customWorkout}});
                }
                navigate("/active");
              }}
              onBack={()=>navigate(activeWorkout.origin||"/dashboard")}
            />
            </PageTransition>
          ) : <Navigate to="/dashboard" replace />
        }/>
        <Route path="/active" element={
          activeWorkout&&user ? (
            <PageTransition>
            <ActiveWorkout workout={activeWorkout.workout} user={user} planLevel={activeWorkout.planLevel} initialDifficulty={activeWorkout.difficulty}
              onFinish={r=>{
                dispatch({type:"FINISH_WORKOUT",payload:{userId:user.id,result:r}});
                toast.success("¡Entrenamiento completado!");
                navigate("/summary");
              }}
              onCancel={()=>navigate(activeWorkout.origin||"/dashboard")}/>
            </PageTransition>
          ) : <Navigate to="/dashboard" replace />
        }/>
        <Route path="/summary" element={
          workoutResult&&user ? (
            <PageTransition>
            <Summary result={workoutResult} user={user} onContinue={()=>navigate("/dashboard")}/>
            </PageTransition>
          ) : <Navigate to="/dashboard" replace />
        }/>
        <Route path="*" element={<Navigate to={user?"/dashboard":"/onboarding"} replace />}/>
      </Routes>
      </AnimatePresence>
      <NavBar hasUser={!!user} accent={S.accent} muted={S.muted} />
    </div>
  );
}
