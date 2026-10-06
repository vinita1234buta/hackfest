import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardHeader from './components/DashboardHeader';
import OverviewTab from './components/OverviewTab';
import StructureTab from './components/StructureTab';
import ArchitectureTab from './components/ArchitectureTab';
import FileExplorerTab from './components/FileExplorerTab';
import AskAiTab from './components/AskAiTab';
import HowToRunTab from './components/HowToRunTab';

const API_BASE = '/api';

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [demoRepos, setDemoRepos] = useState([]);

  // File explorer state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [fileExplanation, setFileExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  // Load demo repos on mount
  useEffect(() => {
    fetch(`${API_BASE}/demo-repos`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDemoRepos(data))
      .catch((err) => console.log('Demo repos fetch fallback:', err));
  }, []);

  // Fetch file content whenever selectedFile changes
  useEffect(() => {
    if (!result || !selectedFile) return;

    setIsLoadingContent(true);
    setFileExplanation(null);

    fetch(`${API_BASE}/file-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        github_url: result.repo_info.url,
        file_path: selectedFile,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to load file');
        }
        return res.json();
      })
      .then((data) => {
        setFileContent(data.content);
      })
      .catch((err) => {
        setFileContent(`// Error loading file: ${err.message}`);
      })
      .finally(() => {
        setIsLoadingContent(false);
      });
  }, [result, selectedFile]);

  const handleAnalyze = async (githubUrl) => {
    setIsLoading(true);
    setError(null);
    setFileExplanation(null);
    setChatMessages([]);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: githubUrl }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Analysis failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setActiveTab('overview');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#a855f7', '#6366f1', '#38bdf8', '#34d399'],
        });
      } catch (e) {}

      // Select first file if available
      if (data.important_files && data.important_files.length > 0) {
        setSelectedFile(data.important_files[0].path);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Unable to analyze repository. Please verify the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainFile = async (path, content) => {
    if (!result || !path) return;
    setIsExplaining(true);

    try {
      const res = await fetch(`${API_BASE}/explain-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_url: result.repo_info.url,
          file_path: path,
          file_content: content,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'File explanation failed');
      }

      const explanation = await res.json();
      setFileExplanation(explanation);
    } catch (err) {
      console.error('Error explaining file:', err);
      alert(`Error explaining file: ${err.message}`);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAskAboutFile = (path) => {
    setSelectedFile(path);
    setActiveTab('ask-ai');
    handleAskAI(`What is the responsibility of \`${path}\` and how does it connect to the rest of the project?`);
  };

  const handleAskAI = async (questionText) => {
    if (!result || !questionText.trim()) return;

    const userMessage = { role: 'user', content: questionText };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsAsking(true);

    try {
      const res = await fetch(`${API_BASE}/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_url: result.repo_info.url,
          question: questionText,
          selected_file: selectedFile,
          conversation_history: chatMessages.slice(-4),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ask AI request failed');
      }

      const data = await res.json();
      const botMessage = { role: 'assistant', content: data.answer };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const botError = {
        role: 'assistant',
        content: `Error: ${err.message || 'Could not communicate with Gemma AI service.'}`,
      };
      setChatMessages((prev) => [...prev, botError]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setSelectedFile(null);
    setFileContent('');
    setFileExplanation(null);
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      <Navbar
        onReset={handleReset}
        currentRepo={result?.repo_info?.full_name}
        onSelectDemo={handleAnalyze}
      />

      <main className="flex-1 pb-16">
        {!result ? (
          <Hero
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
            demoRepos={demoRepos}
            onSelectDemo={handleAnalyze}
          />
        ) : (
          <div>
            <DashboardHeader
              result={result}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onReset={handleReset}
            />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
              {activeTab === 'overview' && (
                <OverviewTab
                  result={result}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'structure' && (
                <StructureTab
                  result={result}
                  onSelectFile={(path) => {
                    setSelectedFile(path);
                    setActiveTab('explorer');
                  }}
                />
              )}

              {activeTab === 'architecture' && (
                <ArchitectureTab
                  result={result}
                  onSelectFile={(path) => {
                    setSelectedFile(path);
                    setActiveTab('explorer');
                  }}
                />
              )}

              {activeTab === 'explorer' && (
                <FileExplorerTab
                  result={result}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  fileContent={fileContent}
                  isLoadingContent={isLoadingContent}
                  onExplainFile={handleExplainFile}
                  fileExplanation={fileExplanation}
                  isExplaining={isExplaining}
                  onAskAboutFile={handleAskAboutFile}
                />
              )}

              {activeTab === 'ask-ai' && (
                <AskAiTab
                  result={result}
                  selectedFile={selectedFile}
                  onAskAI={handleAskAI}
                  chatMessages={chatMessages}
                  isAsking={isAsking}
                />
              )}

              {activeTab === 'how-to-run' && (
                <HowToRunTab result={result} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            GitHub Project Explainer — Hackathon 2026 Edition. Powered by Google Gemma 4.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React + Tailwind Frontend</span>
            <span>•</span>
            <span>Google GenAI SDK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
