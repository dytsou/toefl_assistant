import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useParams,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import ErrorLogs from "./pages/ErrorLogs";
import SpeakingDashboard from "./pages/SpeakingDashboard";
import SpeakingQuestion from "./pages/SpeakingQuestion";
import SpeakingPractice from "./pages/SpeakingPractice";
import SpeakingHistory from "./pages/SpeakingHistory";
import SpeakingErrorLogs from "./pages/SpeakingErrorLogs";
import {
  BookOpen,
  BarChart2,
  Sparkles,
  Mic,
  PanelTopOpen,
} from "lucide-react";
import { api, getGeminiModel, setGeminiModel, type GeminiModelConfig } from "./api";

function PracticeRoute() {
  const { id } = useParams();
  return <Practice key={id} />;
}

function formatGeminiModelLabel(model: string): string {
  return model
    .replace(/^gemini-/, "")
    .replace(/-latest$/, " latest")
    .replace(/-/g, " ");
}

function App() {
  const [geminiConfig, setGeminiConfig] = useState<GeminiModelConfig | null>(
    null,
  );
  const [activeGeminiModel, setActiveGeminiModel] = useState(getGeminiModel());

  useEffect(() => {
    api
      .get("/gemini-models")
      .then((res) => {
        const config = res.data as GeminiModelConfig;
        setGeminiConfig(config);

        const storedModel = getGeminiModel();
        const initialModel =
          storedModel && config.options.includes(storedModel)
            ? storedModel
            : config.defaultModel;

        setActiveGeminiModel(initialModel);
        setGeminiModel(initialModel);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleGeminiModelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextModel = event.target.value;
    setActiveGeminiModel(nextModel);
    setGeminiModel(nextModel);
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="main-nav">
          <div className="nav-content nav-content-row">
            <Link to="/" className="flex items-center gap-2 brand-link">
              <Sparkles size={24} className="text-primary" />
              <span className="brand-link-text text-xl font-bold">TOEFL Pro</span>
            </Link>

            <div className="nav-pills">
              <NavLink
                to="/"
                end
                aria-label="Writing"
                className={({ isActive }) =>
                  `nav-pill ${isActive ? "is-active" : ""}`
                }
              >
                <BookOpen size={16} aria-hidden="true" />
                <span className="nav-pill-label">Writing</span>
              </NavLink>
              <NavLink
                to="/speaking"
                end
                aria-label="Speaking"
                className={({ isActive }) =>
                  `nav-pill ${isActive ? "is-active" : ""}`
                }
              >
                <Mic size={16} aria-hidden="true" />
                <span className="nav-pill-label">Speaking</span>
              </NavLink>
              <NavLink
                to="/errors"
                aria-label="Writing Analytics"
                className={({ isActive }) =>
                  `nav-pill ${isActive ? "is-active" : ""}`
                }
              >
                <BarChart2 size={16} aria-hidden="true" />
                <span className="nav-pill-label">Writing Analytics</span>
              </NavLink>
              <NavLink
                to="/speaking/errors"
                aria-label="Speaking Errors"
                className={({ isActive }) =>
                  `nav-pill ${isActive ? "is-active" : ""}`
                }
              >
                <PanelTopOpen size={16} aria-hidden="true" />
                <span className="nav-pill-label">Speaking Errors</span>
              </NavLink>
            </div>

            <div className="gemini-model-switcher">
              <label htmlFor="gemini-model-select" className="gemini-model-label">
                Gemini Model
              </label>
              <select
                id="gemini-model-select"
                className="gemini-model-select"
                aria-label="Gemini Model"
                title={activeGeminiModel || geminiConfig?.defaultModel || "Gemini Model"}
                value={activeGeminiModel || geminiConfig?.defaultModel || ""}
                onChange={handleGeminiModelChange}
                disabled={!geminiConfig}
              >
                {!geminiConfig ? (
                  <option value="">Loading…</option>
                ) : (
                  geminiConfig.options.map((model) => (
                    <option key={model} value={model} title={model}>
                      {formatGeminiModelLabel(model)}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/practice/:id" element={<PracticeRoute />} />
            <Route path="/errors" element={<ErrorLogs />} />
            <Route path="/analytics" element={<Navigate to="/errors?tab=analytics" replace />} />
            <Route path="/speaking" element={<SpeakingDashboard />} />
            <Route path="/speaking/:id" element={<SpeakingQuestion />} />
            <Route
              path="/speaking/:id/practice"
              element={<SpeakingPractice />}
            />
            <Route
              path="/speaking/:id/history/:partIndex"
              element={<SpeakingHistory />}
            />
            <Route path="/speaking/errors" element={<SpeakingErrorLogs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
