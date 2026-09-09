import React, { useState } from "react";
import { Navbar, NavTab } from "./components/Navbar";
import { HomeOverview } from "./components/HomeOverview";
import { Playground } from "./components/Playground";
import { ArchitectureDiagram } from "./components/ArchitectureDiagram";
import { EvaluationChart } from "./components/EvaluationChart";
import { AttackTaxonomy } from "./components/AttackTaxonomy";
import { CodeRepoViewer } from "./components/CodeRepoViewer";
import { PanelVivaGuide } from "./components/PanelVivaGuide";
import { Shield, BookOpen, ExternalLink, Github, Terminal } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {activeTab === "home" && <HomeOverview setActiveTab={setActiveTab} />}
        {activeTab === "playground" && <Playground />}
        {activeTab === "architecture" && <ArchitectureDiagram />}
        {activeTab === "evaluation" && <EvaluationChart />}
        {activeTab === "taxonomy" && <AttackTaxonomy />}
        {activeTab === "code" && <CodeRepoViewer />}
        {activeTab === "viva" && <PanelVivaGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10 mt-12 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-300">PIAGuard Research Platform</span>
              <span className="block text-[11px] text-slate-500">
                PBL Group 13 · Department of Computer Science & Engineering
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-slate-400">
              Sikkim Manipal Institute of Technology (SMIT)
            </p>
            <p className="text-[11px] text-slate-600">
              Academic Project-Based Learning (PBL) Implementation · 4-Layer Defense Architecture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
