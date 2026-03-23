import { create } from 'zustand';

interface ToolState {
  currentInput: string | null;
  currentOutput: string | null;
  sourceToolId: string | null;
  
  setInput: (input: string | null) => void;
  setOutput: (output: string | null) => void;
  setSourceTool: (toolId: string | null) => void;
  passOutputToInput: (targetToolId: string) => void;
  reset: () => void;
}

export const useToolStore = create<ToolState>((set) => ({
  currentInput: null,
  currentOutput: null,
  sourceToolId: null,

  setInput: (input) => set({ currentInput: input }),
  setOutput: (output) => set({ currentOutput: output }),
  setSourceTool: (toolId) => set({ sourceToolId: toolId }),
  
  // Hand-off logic
  passOutputToInput: (targetToolId) => set((state) => ({
    currentInput: state.currentOutput,
    currentOutput: null,
    sourceToolId: targetToolId,
  })),

  reset: () => set({ currentInput: null, currentOutput: null, sourceToolId: null }),
}));
