import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// Tool-to-tool navigation is a full page reload (see ToolChainer), so this
// hand-off is persisted to sessionStorage to survive it. skipHydration avoids
// a hydration mismatch on first render; AppLayout calls persist.rehydrate()
// once mounted. Consuming tools must check sourceToolId matches their own id
// before consuming currentInput, then clear both — otherwise a hand-off aimed
// at one tool can get silently picked up by a different tool visited later in
// the same tab. currentOutput is excluded from persistence (see partialize):
// it can be large and changes on every keystroke, and it never needs to
// survive a reload since only the pre-navigation currentInput hand-off does.
export const useToolStore = create<ToolState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'tool-chain-handoff',
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (state) => ({ currentInput: state.currentInput, sourceToolId: state.sourceToolId }),
    }
  )
);
