import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge,
  ReactFlowProvider,
  Node,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMarkovStore } from '@/store/useMarkovStore';
import SeveranceNode from './SeveranceNode';
import SeveranceEdge from './SeveranceEdge';

const nodeTypes = {
  severanceNode: SeveranceNode,
};

const edgeTypes = {
  severanceEdge: SeveranceEdge,
};

const defaultEdgeOptions = {
  type: 'severanceEdge',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#E0E5EC',
  },
  style: { stroke: '#E0E5EC', strokeWidth: 1.5 },
  animated: true,
};

const GraphCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useMarkovStore();

  const onConnectHandler: OnConnect = useCallback(
    (params: Connection) => {
      onConnect(params);
    },
    [onConnect]
  );

  return (
    <div className="w-full h-full bg-[#0A0C10]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectHandler}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-[#0A0C10]"
      >
        <Background 
          color="#E0E5EC" 
          gap={20} 
          size={1} 
          className="opacity-5"
        />
        <Controls 
          className="bg-[#0A0C10] border border-[#E0E5EC]/20 [&>button]:text-[#E0E5EC] [&>button]:border-b-[#E0E5EC]/20 hover:[&>button]:bg-[#E0E5EC]/10" 
        />
      </ReactFlow>
    </div>
  );
};

export default function GraphCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <GraphCanvas />
    </ReactFlowProvider>
  );
}
