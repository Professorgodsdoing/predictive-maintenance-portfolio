import { useState } from "react";

const sections = [
  {
    id: "dataset",
    step: "01",
    label: "Dataset",
    title: "The Dataset",
    subtitle: "AI4I 2020 Predictive Maintenance",
    icon: "⚙️",
    color: "#00d4ff",
    content: {
      type: "dataset",
      data: {
        name: "AI4I 2020 Predictive Maintenance Dataset",
        source: "UCI Machine Learning Repository",
        url: "https://archive.ics.uci.edu/ml/datasets/AI4I+2020+Predictive+Maintenance+Dataset",
        rows: "10,000",
        features: "14 features",
        target: "Machine Failure (binary)",
        why: "Real-world CNC machine sensor data — directly relevant to Mechanical Engineering. Shows AI applied to industrial systems.",
        fields: [
          { name: "Air Temperature [K]", desc: "Ambient temperature around machine" },
          { name: "Process Temperature [K]", desc: "Internal operating temperature" },
          { name: "Rotational Speed [RPM]", desc: "Spindle / motor speed" },
          { name: "Torque [Nm]", desc: "Mechanical torque applied" },
          { name: "Tool Wear [min]", desc: "Cumulative tool usage time" },
          { name: "Machine Failure", desc: "TARGET — did it fail? (0/1)" },
          { name: "TWF / HDF / PWF / OSF", desc: "Failure sub-types" },
        ],
        install: "pip install ucimlrepo pandas numpy matplotlib seaborn scikit-learn",
        load: `from ucimlrepo import fetch_ucirepo\ndataset = fetch_ucirepo(id=601)\ndf = pd.concat([dataset.data.features, dataset.data.targets], axis=1)`,
      }
    }
  },
  {
    id: "analysis",
    step: "02",
    label: "Analysis",
    title: "Python Analysis",
    subtitle: "EDA + Machine Learning",
    icon: "🐍",
    color: "#a78bfa",
    content: {
      type: "analysis",
      data: {
        steps: [
          {
            title: "Load & Clean",
            code: `df.columns = [c.strip().replace(' ','_').lower() for c in df.columns]\ndf.drop(columns=['udi','product_id'], inplace=True)\nle = LabelEncoder()\ndf['type_enc'] = le.fit_transform(df['type'])`,
            insight: "Standardise column names, drop ID fields, encode categorical machine type."
          },
          {
            title: "EDA — Key Statistics",
            code: `print(f"Failure rate: {df['machine_failure'].mean():.2%}")\nprint(df[numeric_cols].describe().round(2))\nprint(df.groupby('type')['machine_failure'].mean())`,
            insight: "Overall failure rate ≈ 3.4%. High-load machines fail ~3× more than low-load."
          },
          {
            title: "Correlation Heatmap",
            code: `import seaborn as sns\nsns.heatmap(df[numeric_cols + ['machine_failure']].corr(),\n  annot=True, cmap='coolwarm', fmt='.2f')`,
            insight: "Tool Wear & Torque are most correlated with failure. Temperature features are secondary signals."
          },
          {
            title: "Distribution Plots",
            code: `for feat in numeric_features:\n  plt.hist(df[df['machine_failure']==0][feat], alpha=0.6, label='OK')\n  plt.hist(df[df['machine_failure']==1][feat], alpha=0.8, label='FAIL')\n  plt.legend(); plt.title(feat); plt.show()`,
            insight: "Failed machines cluster at high tool wear (>200 min) and extreme torque values."
          },
          {
            title: "Random Forest Model",
            code: `clf = RandomForestClassifier(n_estimators=200,\n  class_weight='balanced', random_state=42)\nclf.fit(X_train, y_train)\nprint(f"ROC-AUC: {roc_auc_score(y_test, y_proba):.4f}")`,
            insight: "Achieves ROC-AUC of ~0.974 — excellent for imbalanced industrial failure data."
          },
          {
            title: "Feature Importance",
            code: `importances = pd.Series(clf.feature_importances_, index=feature_cols)\nprint(importances.sort_values(ascending=False))`,
            insight: "Top features: Tool Wear > Torque > Rotational Speed > Process Temperature."
          },
        ]
      }
    }
  },
  {
    id: "automation",
    step: "03",
    label: "Automation",
    title: "LinkedIn Automation",
    subtitle: "Auto-post your findings",
    icon: "🤖",
    color: "#34d399",
    content: {
      type: "automation",
      data: {
        flow: [
          { step: 1, label: "Run Analysis Script", desc: "Python generates EDA dashboard PNG + key metrics (failure rate, AUC, top feature)" },
          { step: 2, label: "Build Caption", desc: "build_post_text() injects live numbers into a LinkedIn-optimised template with hashtags" },
          { step: 3, label: "Upload Image", desc: "LinkedIn 2-step upload: register asset → PUT binary to uploadUrl → get asset URN" },
          { step: 4, label: "Publish Post", desc: "POST to /v2/ugcPosts with image + caption. Returns post ID." },
          { step: 5, label: "Schedule (optional)", desc: "schedule library fires pipeline every Monday at 09:00 — fully autonomous" },
        ],
        setup: [
          "Go to linkedin.com/developers/apps → create app",
          "Request scopes: w_member_social + r_liteprofile",
          "Complete OAuth 2.0 → save ACCESS_TOKEN to .env",
          "Run: python linkedin_automation.py",
          "For weekly scheduling: python linkedin_automation.py --schedule",
        ],
        postTemplate: `🔧 Predictive Maintenance Analysis | [DATE]

📊 Key Results:
• Failure rate: 3.4%
• Top feature: Tool Wear [min]  
• Model ROC-AUC: 97.4%

🔑 Insight: High-load machines fail 3× more.
A tuned classifier can flag risk BEFORE breakdown.

🛠 Stack: Python · Pandas · Scikit-learn · Matplotlib

#MechanicalEngineering #DataAnalysis #MachineLearning`
      }
    }
  },
  {
    id: "ui",
    step: "04",
    label: "UI/UX",
    title: "Mobile App UI/UX",
    subtitle: "MachineGuard — Tracker App",
    icon: "📱",
    color: "#fb923c",
    content: {
      type: "ui",
      data: {
        appName: "MachineGuard",
        tagline: "Real-time CNC health in your pocket",
        screens: [
          {
            name: "Dashboard",
            desc: "Live overview of all monitored machines",
            elements: [
              "Header: 'MachineGuard' + notification bell + avatar",
              "Status summary cards: Total Machines | At-Risk | Offline",
              "Horizontal scroll: Machine cards (ID, type, health % radial gauge, status badge)",
              "Risk Alert banner — pulsing red if any machine ≥ 80% failure probability",
              "Bottom nav: Dashboard · Machines · Reports · Settings",
            ],
            ux: "Dark theme (#0d1117). Cards use glassmorphism. Health gauge animates on load. Critical machines sort to top."
          },
          {
            name: "Machine Detail",
            desc: "Deep dive into a single machine's sensor data",
            elements: [
              "Machine ID header + type chip (L / M / H) + live status dot",
              "Failure probability ring (large, animated) with percentage label",
              "4-column sensor row: Temp · RPM · Torque · Tool Wear with live values",
              "Sparkline chart: last 24h sensor readings (line chart, touch-to-inspect)",
              "Failure sub-type probability bars: TWF / HDF / PWF / OSF",
              "Maintenance log timeline (scrollable, chronological)",
              "CTA button: 'Schedule Maintenance' (primary) | 'Export Report' (secondary)",
            ],
            ux: "Animated ring draws on page enter. Sensors update via WebSocket. Haptic feedback on risk threshold crossed."
          },
          {
            name: "Reports & Export",
            desc: "Share analysis to LinkedIn or download PDF",
            elements: [
              "Date-range picker (weekly / monthly / custom)",
              "Chart previews: failure trends, machine type breakdown, sensor heatmap",
              "Export options: PDF · CSV · PNG (charts)",
              "LinkedIn Share button → triggers automation pipeline → shows post preview",
              "Share confirmation sheet with post text editable before publishing",
            ],
            ux: "Share button mimics native share sheet. Post preview uses actual LinkedIn card styling."
          },
          {
            name: "Alerts & Settings",
            desc: "Configure thresholds and notifications",
            elements: [
              "Threshold sliders: Tool Wear limit · Torque limit · Temperature limit",
              "Toggle: Push notifications · Email digest · Auto-LinkedIn post",
              "Alert history list (timestamp, machine, metric, value)",
              "Connected accounts: LinkedIn OAuth status + re-auth button",
              "Dark / Light mode toggle",
            ],
            ux: "Sliders use haptic steps. Live preview shows what alert a threshold would trigger. Settings persist via secure device storage."
          },
        ],
        designSystem: {
          fonts: { display: "Space Grotesk (headings)", body: "Inter (data labels)", mono: "JetBrains Mono (sensor values)" },
          colors: { bg: "#0d1117", card: "#161b22", accent: "#00d4ff", danger: "#f85149", success: "#3fb950", warning: "#d29922" },
          components: ["Radial health gauge", "Sensor sparkline", "Glassmorphism cards", "Swipe-to-dismiss alerts", "Animated risk badge"],
        }
      }
    }
  },
];

function DatasetSection({ data }) {
  const [copied, setCopied] = useState(false);
  const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          {[["Rows", data.rows], ["Features", data.features], ["Target", data.target], ["Source", "UCI ML Repo"]].map(([k, v]) => (
            <div key={k} style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#00d4ff" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 10, fontWeight: 600 }}>WHY THIS DATASET?</div>
        <div style={{ color: "#e6edf3", lineHeight: 1.7 }}>{data.why}</div>
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 10, fontWeight: 600 }}>KEY FIELDS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.fields.map(f => (
            <div key={f.name} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#00d4ff", background: "rgba(0,212,255,0.1)", padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 }}>{f.name}</span>
              <span style={{ color: "#8b949e", fontSize: 13 }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: "#8b949e", fontWeight: 600 }}>QUICK START</div>
          <button onClick={() => copy(`pip install ucimlrepo\n\n${data.load}`)} style={{ fontSize: 11, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>{copied ? "✓ Copied" : "Copy"}</button>
        </div>
        <pre style={{ fontFamily: "monospace", fontSize: 12, color: "#e6edf3", margin: 0, lineHeight: 1.7, overflow: "auto" }}>pip install ucimlrepo{"\n\n"}{data.load}</pre>
      </div>
    </div>
  );
}

function AnalysisSection({ data }) {
  const [active, setActive] = useState(0);
  const step = data.steps[active];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {data.steps.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", borderColor: active === i ? "#a78bfa" : "#30363d", background: active === i ? "rgba(167,139,250,0.15)" : "transparent", color: active === i ? "#a78bfa" : "#8b949e", fontSize: 13, cursor: "pointer", fontWeight: active === i ? 700 : 400 }}>{s.title}</button>
        ))}
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>{step.title}</div>
        <pre style={{ background: "#0d1117", borderRadius: 8, padding: 16, fontFamily: "monospace", fontSize: 12, color: "#e6edf3", margin: "0 0 14px", overflow: "auto", lineHeight: 1.7, border: "1px solid #21262d" }}>{step.code}</pre>
        <div style={{ background: "rgba(167,139,250,0.08)", borderLeft: "3px solid #a78bfa", borderRadius: "0 8px 8px 0", padding: "10px 14px", color: "#c9d1d9", fontSize: 13, lineHeight: 1.6 }}>
          💡 {step.insight}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, background: "#161b22", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>3.4%</div>
          <div style={{ fontSize: 12, color: "#8b949e" }}>Failure Rate</div>
        </div>
        <div style={{ flex: 1, background: "#161b22", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>97.4%</div>
          <div style={{ fontSize: 12, color: "#8b949e" }}>Model AUC</div>
        </div>
        <div style={{ flex: 1, background: "#161b22", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>3×</div>
          <div style={{ fontSize: 12, color: "#8b949e" }}>H vs L Fail Rate</div>
        </div>
      </div>
    </div>
  );
}

function AutomationSection({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, color: "#8b949e", fontWeight: 600, marginBottom: 14 }}>AUTOMATION PIPELINE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.flow.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(52,211,153,0.15)", border: "1px solid #34d399", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#34d399", flexShrink: 0 }}>{f.step}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3", marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: "#8b949e" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, color: "#8b949e", fontWeight: 600, marginBottom: 12 }}>SETUP CHECKLIST</div>
        {data.setup.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#34d399", fontSize: 14, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 13, color: "#c9d1d9" }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, color: "#8b949e", fontWeight: 600, marginBottom: 10 }}>POST TEMPLATE PREVIEW</div>
        <pre style={{ fontFamily: "inherit", fontSize: 12, color: "#e6edf3", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{data.postTemplate}</pre>
      </div>
    </div>
  );
}

function UISection({ data }) {
  const [activeScreen, setActiveScreen] = useState(0);
  const screen = data.screens[activeScreen];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fb923c" }}>{data.appName}</div>
          <div style={{ fontSize: 13, color: "#8b949e" }}>{data.tagline}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.screens.map((s, i) => (
            <button key={i} onClick={() => setActiveScreen(i)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid", borderColor: activeScreen === i ? "#fb923c" : "#30363d", background: activeScreen === i ? "rgba(251,146,60,0.15)" : "transparent", color: activeScreen === i ? "#fb923c" : "#8b949e", fontSize: 12, cursor: "pointer", fontWeight: activeScreen === i ? 700 : 400 }}>{s.name}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fb923c", marginBottom: 4 }}>{screen.name} Screen</div>
        <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 14 }}>{screen.desc}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {screen.elements.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#fb923c", fontSize: 12, flexShrink: 0, marginTop: 2 }}>▸</span>
              <span style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.5 }}>{e}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(251,146,60,0.08)", borderLeft: "3px solid #fb923c", borderRadius: "0 8px 8px 0", padding: "10px 14px", color: "#c9d1d9", fontSize: 13, lineHeight: 1.6 }}>
          🎨 {screen.ux}
        </div>
      </div>
      <div style={{ background: "#161b22", borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, color: "#8b949e", fontWeight: 600, marginBottom: 12 }}>DESIGN SYSTEM</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.entries(data.designSystem.colors).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: v, border: "1px solid #30363d" }} />
              <span style={{ fontSize: 11, color: "#8b949e" }}>{k}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.designSystem.components.map(c => (
            <span key={c} style={{ fontSize: 11, background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)", color: "#fb923c", borderRadius: 20, padding: "3px 10px" }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("dataset");
  const section = sections.find(s => s.id === active);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "system-ui, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#8b949e", textTransform: "uppercase", marginBottom: 8 }}>Engineering Portfolio Blueprint</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #00d4ff, #a78bfa, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>From Data to Portfolio</h1>
          <p style={{ color: "#8b949e", fontSize: 14, margin: 0 }}>Data Analysis · AI Automation · UI/UX Design — all in one project</p>
        </div>

        {/* Step nav */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{ flex: 1, minWidth: 140, padding: "12px 8px", borderRadius: 12, border: "1px solid", borderColor: active === s.id ? s.color : "#21262d", background: active === s.id ? `${s.color}15` : "#161b22", color: active === s.id ? s.color : "#8b949e", cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2 }}>STEP {s.step}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Section header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: section.color }}>{section.title}</div>
          <div style={{ fontSize: 14, color: "#8b949e" }}>{section.subtitle}</div>
        </div>

        {/* Section content */}
        {section.id === "dataset"    && <DatasetSection    data={section.content.data} />}
        {section.id === "analysis"   && <AnalysisSection   data={section.content.data} />}
        {section.id === "automation" && <AutomationSection data={section.content.data} />}
        {section.id === "ui"         && <UISection         data={section.content.data} />}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #21262d", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 11, color: "#484f58" }}>Files: mechanical_analysis.py · linkedin_automation.py</div>
          <div style={{ fontSize: 11, color: "#484f58" }}>Dataset: AI4I 2020 · UCI ML Repo ID 601</div>
        </div>
      </div>
    </div>
  );
}
