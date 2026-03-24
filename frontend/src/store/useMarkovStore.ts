import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { MarkovSystem } from '@/core/MarkovSystem';
import { Event } from '@/core/Event';
import { Transition } from '@/core/Transition';

interface MarkovState {
  nodes: Node[];
  edges: Edge[];
  system: MarkovSystem; // The core logic instance
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  
  addEvent: (name: string) => void;
  updateEventName: (id: string, name: string) => void;
  updateTransitionProbability: (id: string, prob: number) => void;
  runSimulation: (steps: number, initialProbs?: number[]) => { steps: number[]; distributions: number[][] };
  validateSystem: () => string[]; // Returns validation error messages
}

export const useMarkovStore = create<MarkovState>((set, get) => ({
  nodes: [],
  edges: [],
  system: new MarkovSystem(), // Initialize core system

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    // Sync removal logic if nodes are deleted
    changes.forEach((change) => {
        if (change.type === 'remove') {
            const system = get().system;
            system.removeEvent(change.id);
        }
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    // Sync removal logic for edges
    changes.forEach((change) => {
        if (change.type === 'remove') {
            const system = get().system;
            system.removeTransition(change.id);
        }
    });
  },

  onConnect: (connection: Connection) => {
    const { source, target } = connection;
    if (!source || !target) return;

    // Generate a new Transition in the core system
    const system = get().system;
    const newTransitionId = `e${source}-${target}-${Date.now()}`;
    
    // Default probability is 1/N where N is number of outgoing edges? Or just 0.5?
    // Let's default to 0.5 or user can edit. 
    // Ideally, we should check existing edges and distribute, but for now fixed.
    const newTransition = new Transition(newTransitionId, source, target, 0.5);
    
    try {
        system.addTransition(newTransition);
        
        // Update React Flow state
        const newEdge: Edge = {
            id: newTransitionId,
            source,
            target,
            type: 'severanceEdge', // Custom edge type
            data: { probability: 0.5 },
            animated: true,
        };

        set({
            edges: addEdge(newEdge, get().edges),
        });
    } catch (e) {
        console.error("Failed to add transition", e);
    }
  },

  addEvent: (name: string) => {
    const system = get().system;
    const id = `node-${Date.now()}`;
    const newEvent = new Event(id, name);
    
    try {
        system.addEvent(newEvent);

        // Add to React Flow
        const newNode: Node = {
            id,
            position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position
            data: { label: name },
            type: 'severanceNode', // Custom node type
        };

        set({
            nodes: [...get().nodes, newNode],
        });
    } catch (e) {
        console.error("Failed to add event", e);
    }
  },

  updateEventName: (id: string, name: string) => {
      const system = get().system;
      const event = system.events.get(id);
      if (event) {
          event.rename(name);
          // Sync UI
          set({
              nodes: get().nodes.map((node) => {
                  if (node.id === id) {
                      return { ...node, data: { ...node.data, label: name } };
                  }
                  return node;
              }),
          });
      }
  },

  updateTransitionProbability: (id: string, prob: number) => {
      const system = get().system;
      system.updateTransitionProbability(id, prob);

      // Sync UI
      set({
          edges: get().edges.map((edge) => {
              if (edge.id === id) {
                  return { ...edge, data: { ...edge.data, probability: prob } };
              }
              return edge;
          }),
      });
  },

  runSimulation: (steps: number, initialProbs?: number[]) => {
      const system = get().system;
      return system.simulate(steps, initialProbs);
  },

  validateSystem: () => {
      const system = get().system;
      const errors = system.validate();
      return errors.map(e => e.error); // Return string array of errors
  }
}));
