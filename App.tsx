
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { Sidebar } from './components/Sidebar';
import { ChatState, Message, Role, OllamaModel } from './types';
import { fetchModels, streamChat } from './services/api';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    selectedModel: '',
    error: null,
  });
  
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await fetchModels();
        setAvailableModels(models);
        if (models.length > 0) {
          setState(prev => ({ ...prev, selectedModel: models[0].name }));
        }
      } catch (err) {
        setState(prev => ({ ...prev, error: 'Failed to load models. Ensure Ollama is running and backend is reachable.' }));
      }
    };
    loadModels();
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !state.selectedModel) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content,
      timestamp: Date.now(),
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: Role.ASSISTANT,
      content: '',
      timestamp: Date.now() + 1,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg, assistantMsg],
      isLoading: true,
      error: null,
    }));

    abortControllerRef.current = new AbortController();

    try {
      await streamChat(
        state.selectedModel,
        [...state.messages, userMsg],
        (chunk) => {
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(m => 
              m.id === assistantMsgId 
                ? { ...m, content: m.content + chunk } 
                : m
            )
          }));
        },
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setState(prev => ({ ...prev, error: `Error: ${err.message}` }));
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedModel, state.messages]);

  const handleClearChat = () => {
    setState(prev => ({ ...prev, messages: [], error: null }));
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar 
        models={availableModels} 
        selectedModel={state.selectedModel}
        onSelectModel={(m) => setState(prev => ({ ...prev, selectedModel: m }))}
        onClearChat={handleClearChat}
      />
      
      <main className="flex-1 flex flex-col relative">
        {state.error && (
          <div className="bg-red-900/50 border-b border-red-500/50 p-3 text-center text-sm text-red-200 animate-pulse">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {state.error}
          </div>
        )}
        
        <ChatWindow 
          messages={state.messages}
          isLoading={state.isLoading}
          onSendMessage={handleSendMessage}
          onStop={handleStopGeneration}
        />
      </main>
    </div>
  );
};

export default App;
