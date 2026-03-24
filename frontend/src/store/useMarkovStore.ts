import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

// Replaced core logic with API interactions
// No local MarkovSystem TS class needed, just types

interface SimulationResult {
    steps: number[];
    distributions: number[][];
}

interface MatrixResult {
    ids: string[];
    values: number[][];
}

export interface MarkovState {
  nodes: Node[];
  edges: Edge[];
  
  // State from backend
  simulationResult: SimulationResult | null;
  matrixResult: MatrixResult | null;
  validationErrors: string[];

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addEvent: (name: string) => void;
  updateEventName: (id: string, name: string) => void;
  updateTransitionProbability: (id: string, prob: number) => void;
  
  // Async actions calling Python backend
  runSimulation: (steps?: number) => Promise<void>;
  validateSystem: () => Promise<string[]>; // Returns validation error messages
}

const API_BASE = 'http://localhost:5000';

export const useMarkovStore = create<MarkovState>((set, get) => ({
  nodes: [],
  edges: [],
  simulationResult: null,
  matrixResult: null,
  validationErrors: [],

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    const { source, target } = connection;
    if (!source || !target) return;

    const newTransitionId = `e${source}-${target}-${Date.now()}`;
    
    // Create new edge with default prob 0.5
    const newEdge: Edge = {
        id: newTransitionId,
        source,
        target,
        type: 'severanceEdge', 
        data: { probability: 0.5 },
        animated: true,
    };

    set({ edges: addEdge(newEdge, get().edges) });
  },

  addEvent: (name: string) => {
    const id = `node-${Date.now()}`;
    const newNode: Node = {
        id,
        position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 }, 
        data: { label: name },
        type: 'severanceNode', 
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  updateEventName: (id: string, name: string) => {
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, label: name } };
        }
        return n;
      }),
    });
  },

  updateTransitionProbability: (id: string, prob: number) => {
    set({
      edges: get().edges.map((e) => {
        if (e.id === id) {
          return { ...e, data: { ...e.data, probability: prob } };
        }
        return e;
      }),
    });
  },

  runSimulation: async (steps: number = 20) => {
    const { nodes, edges } = get();
    
    // Prepare payload -> Python backend expects specific structure
    // We send nodes and edges as is, backend parses 'data' field
    try {
      const payload = {
          nodes: nodes,
          edges: edges,
          steps: steps
      };

      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Simulation Error:", errorData);
        if (errorData.validation_errors) {
            set({ validationErrors: errorData.validation_errors });
        }
        return;
      }

      const data = await res.json();
      set({
        matrixResult: data.matrix,      // { ids: [...], values: [[...]] }
        simulationResult: data.simulation, // { steps: [...], distributions: [[...]] }
        validationErrors: []
      });

    } catch (error) {
      console.error("Backend Connection Error:", error);
      set({ validationErrors: ["Backend Disconnected (Check Python Server)"] });
    }
  },

  validateSystem: async () => {
    const { nodes, edges } = get();
    try {
      const res = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      
      const data = await res.json();
      const errors = data.errors || [];
      set({ validationErrors: errors });
      return errors;

    } catch (error) {
      console.error("Backend Connection Error:", error);
      const errs = ["Backend Disconnected (Check Python Server)"];
      set({ validationErrors: errs });
      return errs;
    }
  },
}));
