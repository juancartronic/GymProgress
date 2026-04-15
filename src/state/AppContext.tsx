import React, { createContext, useContext, useReducer, type Dispatch } from "react";
import { appReducer, initialState, type AppReducerState, type AppAction } from "./appReducer";

interface AppContextValue {
  state: AppReducerState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Context provider that wraps the app with useReducer-based state management. */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

/** Hook to access current app state from AppContext. Must be used inside `<AppProvider>`. */
export function useAppState(): AppReducerState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx.state;
}

/** Hook to access the dispatch function from AppContext. Must be used inside `<AppProvider>`. */
export function useAppDispatch(): Dispatch<AppAction> {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppDispatch must be used within AppProvider");
  return ctx.dispatch;
}
