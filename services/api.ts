
import { OllamaModel, Message } from '../types';

const API_BASE = '/api';

export const fetchModels = async (): Promise<OllamaModel[]> => {
  const response = await fetch(`${API_BASE}/models`);
  if (!response.ok) throw new Error('Failed to fetch models');
  const data = await response.json();
  return data.models || [];
};

export const streamChat = async (
  model: string,
  messages: Message[],
  onChunk: (chunk: string) => void,
  signal: AbortSignal
): Promise<void> => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true
    }),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Chat request failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('ReadableStream not supported');

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Accumulate the current chunk into our buffer
    buffer += decoder.decode(value, { stream: true });
    
    // Process the buffer line by line
    let boundary = buffer.indexOf('\n');
    while (boundary !== -1) {
      const line = buffer.substring(0, boundary).trim();
      buffer = buffer.substring(boundary + 1);
      
      if (line) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            onChunk(json.message.content);
          }
          if (json.done) return;
        } catch (e) {
          console.warn('Failed to parse complete JSON line:', line);
        }
      }
      boundary = buffer.indexOf('\n');
    }
  }
};
