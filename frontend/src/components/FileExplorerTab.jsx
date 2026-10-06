import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  Search, 
  Sparkles, 
  MessageSquare, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle,
  Link2,
  Code2,
  Layers,
  Star
} from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

// Recursive Tree Node Item
function TreeNode({ node, level, selectedPath, onSelectFile, expandedFolders, toggleFolder }) {
  const isDir = node.type === 'dir';
  const isExpanded = expandedFolders[node.path];
  const isSelected = selectedPath === node.path;

  if (isDir) {
    return (
      <div>
        <div
          onClick={() => toggleFolder(node.path)}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-white/5 cursor-pointer text-xs text-slate-300 font-medium select-none group transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-purple-400" />
          ) : (
            <Folder className="w-4 h-4 text-purple-400/80" />
          )}
          <span className="truncate group-hover:text-white">{node.name}</span>
        </div>

        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                level={level + 1}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectFile(node.path)}
      style={{ paddingLeft: `${level * 16 + 24}px` }}
      className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer text-xs font-mono transition-colors select-none ${
        isSelected
          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-300' : 'text-slate-500'}`} />
        <span className="truncate">{node.name}</span>
      </div>
      {node.is_important && (
        <span title="High Priority Source File" className="shrink-0 text-amber-400">
          <Star className="w-3 h-3 fill-amber-400/30" />
        </span>
      )}
    </div>
  );
}

export default function FileExplorerTab({
  result,
  selectedFile,
  setSelectedFile,
  fileContent,
  isLoadingContent,
  onExplainFile,
  fileExplanation,
  isExplaining,
  onAskAboutFile
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [copied, setCopied] = useState(false);

  // Initialize first important file or default file
  useEffect(() => {
    if (!selectedFile && result.file_tree && result.file_tree.length > 0) {
      // Find first file
      const findFirstFile = (nodes) => {
        for (const n of nodes) {
          if (n.type === 'file') return n.path;
          if (n.children) {
            const found = findFirstFile(n.children);
            if (found) return found;
          }
        }
        return null;
      };
      const first = (result.important_files && result.important_files[0]?.path) || findFirstFile(result.file_tree);
      if (first) {
        setSelectedFile(first);
      }
    }
  }, [result, selectedFile, setSelectedFile]);

  // Auto-expand root folders
  useEffect(() => {
    if (result.file_tree) {
      const initial = {};
      result.file_tree.forEach((n) => {
        if (n.type === 'dir') initial[n.path] = true;
      });
      setExpandedFolders((prev) => ({ ...initial, ...prev }));
    }
  }, [result]);

  // Syntax highlighting trigger
  useEffect(() => {
    if (fileContent) {
      Prism.highlightAll();
    }
  }, [fileContent, selectedFile]);

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopyCode = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      {/* Left Sidebar: File Tree (4 Cols) */}
      <div className="lg:col-span-4 rounded-2xl glass-panel border border-white/10 p-4 flex flex-col h-[700px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Folder className="w-4 h-4 text-purple-400" />
            <span>Repository Files</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {result.repo_info?.default_branch || 'main'}
          </span>
        </div>

        {/* Search Filter */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
          {result.file_tree && result.file_tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              level={0}
              selectedPath={selectedFile}
              onSelectFile={(path) => setSelectedFile(path)}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      </div>

      {/* Right Area: Code Viewer & AI Explanation (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        {/* Code Viewer Panel */}
        <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden flex flex-col h-[420px]">
          {/* File Header */}
          <div className="px-5 py-3 bg-[#0d1322] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-xs sm:text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
                {selectedFile || 'Select a file to inspect'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                disabled={!fileContent}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors disabled:opacity-40"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => onExplainFile(selectedFile, fileContent)}
                disabled={isExplaining || !selectedFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExplaining ? 'Explaining...' : 'Explain This File'}</span>
              </button>

              <button
                onClick={() => onAskAboutFile(selectedFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>

          {/* Code Content Container */}
          <div className="flex-1 overflow-auto bg-[#090d16] p-4 text-xs font-mono">
            {isLoadingContent ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mr-2" />
                Loading file from GitHub...
              </div>
            ) : fileContent ? (
              <pre className="!bg-transparent !p-0 !m-0 !border-0 text-slate-200">
                <code className="language-javascript font-mono">
                  {fileContent}
                </code>
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select any file in the explorer tree on the left to inspect its code.
              </div>
            )}
          </div>
        </div>

        {/* AI Explanation Drawer / Panel */}
        {fileExplanation && (
          <div className="rounded-2xl glass-panel border border-purple-500/30 p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Gemma 4 Code Breakdown
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                      {fileExplanation.language}
                    </span>
                  </div>
                  <h3 className="font-mono text-sm sm:text-base font-bold text-white mt-0.5">
                    {fileExplanation.file_path}
                  </h3>
                </div>
              </div>
            </div>

            {/* Beginner Summary & Analogy */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Beginner-Friendly Explanation:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-normal bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                {fileExplanation.beginner_summary}
              </p>
            </div>

            {/* Purpose & Primary Responsibility */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Primary Responsibility:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {fileExplanation.purpose}
              </p>
            </div>

            {/* Important Functions */}
            {fileExplanation.important_functions && fileExplanation.important_functions.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Important Functions & Methods:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fileExplanation.important_functions.map((fn, fi) => (
                    <div key={fi} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                      <div className="font-mono text-xs font-bold text-purple-300">
                        {fn.name}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {fn.purpose}
                      </p>
                      {fn.parameters && fn.parameters !== 'None' && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          <span className="text-slate-500">Params:</span> {fn.parameters}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs & Outputs & Relationships */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Inputs & Outputs:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {fileExplanation.inputs_outputs}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Collaborating Modules:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {fileExplanation.relationships}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
