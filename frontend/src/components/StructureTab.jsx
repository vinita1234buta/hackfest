import React from 'react';
import { 
  FolderTree, 
  Folder, 
  FileCode, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  Layers, 
  FileText,
  Link2
} from 'lucide-react';

export default function StructureTab({ result, onSelectFile }) {
  const { repository_structure, important_files } = result;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Folder Hierarchy Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-purple-400" />
            Repository Folders & Structure
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key directories explained for beginners — understand where each piece of code belongs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repository_structure.map((folder, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl glass-panel border border-white/5 space-y-2 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  <Folder className="w-4 h-4" />
                </div>
                <span className="font-mono text-sm font-semibold text-white">
                  {folder.path}/
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-9">
                {folder.purpose}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Important Files Grid */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              Important Files
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Crucial entrypoints, configuration manifests, and core operational files
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            {important_files.length} Key Files Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {important_files.map((file, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl glass-panel glass-panel-hover border border-white/5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-mono text-sm font-bold text-white break-all">
                      {file.path}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                    file.importance === 'high' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {file.importance} priority
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {file.purpose}
                </p>

                {/* Key Components */}
                {file.key_components && file.key_components.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Functions / Components:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {file.key_components.map((comp, ci) => (
                        <span key={ci} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {file.dependencies && file.dependencies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-slate-400" />
                      Dependencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {file.dependencies.map((dep, di) => (
                        <span key={di} className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/5 text-purple-300 border border-purple-500/10">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => onSelectFile(file.path)}
                  className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>Inspect Code & Explain</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
