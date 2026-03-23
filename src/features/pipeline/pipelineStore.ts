import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow';
import type { RegistryTool } from '@/tools/toolRegistry';
import { executeNode } from './executionEngine';

export type PipelineNodeData = {
  tool: RegistryTool;
  status: 'idle' | 'running' | 'success' | 'error';
  input?: string;
  output?: any;
};

export type PipelineNode = Node<PipelineNodeData>;

export interface PipelineState {
  nodes: PipelineNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (tool: RegistryTool, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<PipelineNodeData>) => void;
  runPipeline: () => Promise<void>;
  clearPipeline: () => void;
  deleteNode: (nodeId: string) => void;
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as PipelineNode[],
        });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
      addNode: (tool: RegistryTool, position: { x: number; y: number }) => {
        const newNode: PipelineNode = {
          id: `${tool.id}-${Date.now()}`,
          type: 'toolNode',
          position,
          data: {
            tool,
            status: 'idle',
          },
        };
        set({ nodes: [...get().nodes, newNode] });
      },
      deleteNode: (nodeId: string) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        });
      },
      updateNodeData: (nodeId: string, data: Partial<PipelineNodeData>) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              return { ...node, data: { ...node.data, ...data } };
            }
            return node;
          }),
        });
      },
      clearPipeline: () => {
        set({ nodes: [], edges: [] });
      },
      runPipeline: async () => {
        const { nodes, edges, updateNodeData } = get();

        // Reset status
        nodes.forEach(n => updateNodeData(n.id, { status: 'idle', output: undefined }));

        // Build adjacency list for BFS topological traversal
        const adj = new Map<string, string[]>();
        const inDegree = new Map<string, number>();

        nodes.forEach(n => {
          adj.set(n.id, []);
          inDegree.set(n.id, 0);
        });

        edges.forEach(e => {
          if (adj.has(e.source) && inDegree.has(e.target)) {
            adj.get(e.source)!.push(e.target);
            inDegree.set(e.target, inDegree.get(e.target)! + 1);
          }
        });

        // Find root nodes (no incoming edges)
        const queue: string[] = [];
        nodes.forEach(n => {
          if (inDegree.get(n.id) === 0) queue.push(n.id);
        });

        const outputs = new Map<string, any>();

        while (queue.length > 0) {
          const currId = queue.shift()!;
          const node = get().nodes.find(n => n.id === currId);
          if (!node) continue;

          updateNodeData(currId, { status: 'running' });

          // Determine input
          const incomingEdges = edges.filter(e => e.target === currId);
          let inputToProcess: any = node.data.input;

          if (incomingEdges.length > 0) {
            const parentId = incomingEdges[0].source;
            inputToProcess = outputs.get(parentId);
          }

          try {
            const output = await executeNode(node.data.tool.id, inputToProcess || '');
            outputs.set(currId, output);
            updateNodeData(currId, { status: 'success', output });

            for (const childId of adj.get(currId) || []) {
              inDegree.set(childId, inDegree.get(childId)! - 1);
              if (inDegree.get(childId) === 0) {
                queue.push(childId);
              }
            }
          } catch (err) {
            console.error(err);
            updateNodeData(currId, { status: 'error' });
            break;
          }
        }
      },
    }),
    {
      name: 'ozone-pipeline-storage',
    }
  )
);
