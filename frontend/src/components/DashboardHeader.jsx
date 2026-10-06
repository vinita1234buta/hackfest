import React from 'react';
import { 
  BookOpen, 
  Layers, 
  FolderTree, 
  MessageSquare, 
  PlayCircle, 
  ExternalLink, 
  Star, 
  GitFork, 
  AlertCircle, 
  Scale, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function DashboardHeader({ 
  result, 
  activeTab, 
  setActiveTab, 
  onReset 
}) {
  const { repo_info, model_used } = result;

  const tabs = [
    { id: 'overview', label: 'Overview & Stack', icon: BookOpen },
    { id: 'structure', label: 'Repository Structure', icon: FolderTree },
    { id: 'architecture', label: 'Architecture & Flow', icon: Layers },
    { id: 'explorer', label: 'File Explorer & Code', icon: Layers },
    { id: 'ask-ai', label: 'Ask AI (Gemma 4)', icon: MessageSquare, badge: 'Interactive' },
    { id: 'how-to-run', label: 'How To Run', icon: PlayCircle },
  ];

  return (
    <div className="border-b border-white/10 bg-[#0d1322]/80 backdrop-blur-md sticky top-[61px] z-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-5 pb-0">
        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onReset}
              className="mt-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Back to search"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {repo_info.name}
                </h1>
                <span className="text-xs text-slate-400 font-mono">
                  by {repo_info.owner}
                </span>
                <a
                  href={repo_info.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20"
                >
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {repo_info.primary_language && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {repo_info.primary_language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                  {repo_info.stars.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  <GitFork className="w-3 h-3 text-indigo-400" />
                  {repo_info.forks.toLocaleString()}
                </span>
                {repo_info.license && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <Scale className="w-3 h-3 text-slate-400" />
                    {repo_info.license}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Model: {model_used}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-white/5 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'text-white border-purple-500'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
