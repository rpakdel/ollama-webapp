
import React from 'react';
import { OllamaModel } from '../types';

interface SidebarProps {
  models: OllamaModel[];
  selectedModel: string;
  onSelectModel: (name: string) => void;
  onClearChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ models, selectedModel, onSelectModel, onClearChat }) => {
  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
          <i className="fas fa-brain"></i>
          Ollama Web
        </h1>
        <p className="text-xs text-slate-500 mt-1">Local Intelligence Explorer</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
            Select Model
          </label>
          <div className="space-y-1">
            {models.length === 0 ? (
              <p className="text-sm text-slate-600 italic">No models found...</p>
            ) : (
              models.map((model) => (
                <button
                  key={model.digest}
                  onClick={() => onSelectModel(model.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                    selectedModel === model.name
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'hover:bg-slate-800 text-slate-400 border border-transparent'
                  }`}
                >
                  <i className={`fas fa-cube ${selectedModel === model.name ? 'text-indigo-400' : 'text-slate-600'}`}></i>
                  <span className="truncate">{model.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
           <button
            onClick={onClearChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            <i className="fas fa-trash-alt"></i>
            Clear Conversation
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-[10px] text-slate-600">
        <div className="flex justify-between items-center mb-1">
          <span>Backend Status</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Online
          </span>
        </div>
        <p>API Endpoint: /api/chat</p>
      </div>
    </aside>
  );
};
