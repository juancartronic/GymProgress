import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./state/AppContext";
import "./i18n";

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || "Error desconocido" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error rendering app:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#080810",
            color: "#f0f0f0",
            fontFamily: "sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px" }}>Error al cargar la app</h1>
            <p style={{ margin: "0 0 8px", opacity: 0.8 }}>{this.state.errorMessage}</p>
            <p style={{ margin: 0, opacity: 0.6 }}>Recarga la pagina. Si persiste, avisame y lo corregimos.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const bootstrapStorage = () => {
  if (!window.storage) {
    window.storage = {
      async get(key) {
        const value = localStorage.getItem(key);
        return value === null ? null : { value };
      },
      async set(key, value) {
        localStorage.setItem(key, value);
      },
    };
  }
};

bootstrapStorage();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontro el contenedor #root en index.html");
}

const showFatalError = (message: string) => {
  rootElement.innerHTML = `
    <div style="min-height:100vh;background:#080810;color:#f0f0f0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:sans-serif;">
      <div>
        <h1 style="margin:0 0 8px;">Error al iniciar la app</h1>
        <p style="margin:0 0 8px;opacity:.85;">${String(message)}</p>
        <p style="margin:0;opacity:.65;">Comparte este mensaje y lo corrijo al instante.</p>
      </div>
    </div>
  `;
};

const bootstrap = async () => {
  try {
    const mod = await import("../GymProgressApp.tsx");
    const App = mod.default;

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <AppErrorBoundary>
          <BrowserRouter>
            <AppProvider>
              <App />
            </AppProvider>
          </BrowserRouter>
        </AppErrorBoundary>
      </React.StrictMode>
    );
  } catch (error: unknown) {
    console.error("Fatal bootstrap error:", error);
    showFatalError(error instanceof Error ? error.message : String(error));
  }
};

bootstrap();
