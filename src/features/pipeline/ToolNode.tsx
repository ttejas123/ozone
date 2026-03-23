import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { PipelineNodeData } from './pipelineStore';
import { usePipelineStore } from './pipelineStore';
import { clsx } from 'clsx';
import { CheckCircle2, Loader2, Play, Trash2 } from 'lucide-react';

export function ToolNode({ id, data }: NodeProps<PipelineNodeData>) {
  const deleteNode = usePipelineStore((state) => state.deleteNode);
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);
  const edges = usePipelineStore((state) => state.edges);
  
  const { tool, status, input, output } = data;
  const Icon = tool.icon;

  const isIdle = status === 'idle';
  const isRunning = status === 'running';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  // Determine if this is a root node (no incoming edges)
  const isRoot = !edges.some(e => e.target === id);

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([typeof output === 'string' ? output : JSON.stringify(output, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.id}-result.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={clsx(
      "relative bg-white dark:bg-zinc-900 rounded-xl border-2 p-4 shadow-sm w-72 transition-all duration-300",
      isIdle && "border-zinc-200 dark:border-zinc-800",
      isRunning && "border-brand-500 shadow-brand-500/20 shadow-lg",
      isSuccess && "border-green-500 shadow-green-500/20",
      isError && "border-red-500 shadow-red-500/20"
    )}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            "p-2 rounded-lg",
            isIdle && "bg-brand-500/10 text-brand-500",
            isRunning && "bg-brand-500 text-white animate-pulse",
            isSuccess && "bg-green-500/10 text-green-500",
            isError && "bg-red-500/10 text-red-500"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              {tool.name}
            </h3>
            <p className="text-xs text-zinc-500">{tool.category}</p>
          </div>
        </div>
        
        <button 
          onClick={() => deleteNode(id)}
          className="text-zinc-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isRoot && (
        <div className="mb-3">
          <textarea 
            className="w-full h-16 text-xs p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Enter input here..."
            value={input || ''}
            onChange={(e) => updateNodeData(id, { input: e.target.value })}
            disabled={isRunning}
          />
        </div>
      )}

      {isSuccess && output && (
        <div className="mb-3">
          <button 
            onClick={handleDownload}
            className="w-full text-xs font-medium py-1.5 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            Download Output
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
          {tool.inputType.length > 0 ? tool.inputType[0].toUpperCase() : 'NONE'}
        </span>
        
        {isRunning && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {isIdle && <Play className="w-4 h-4 text-zinc-300" />}

        <span className="text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
          {tool.outputType.length > 0 ? tool.outputType[0].toUpperCase() : 'NONE'}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900"
      />
    </div>
  );
}
