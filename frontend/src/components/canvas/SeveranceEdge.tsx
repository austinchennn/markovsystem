import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from 'reactflow';

const SeveranceEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [prob, setProb] = useState(data?.probability?.toFixed(2) || '0.50');

  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    // Ideally update store as well
    // But for simplicity, we rely on parent update via edge state
    // Actually, we should call a method here to update `MarkovSystem` probability too?
    // The `useMarkovStore` should handle probability updates.
    // We can dispatch an event or use context.
    // For now, let's keep it simple: assume user edits in a side panel or just display probability.
    // Or dispatch via window event? No structure is clean.
    // But wait, the prompt asks "click point to drag arrow... probability... must sum to 1".
    
    // Better: dispatch a custom event or use the store directly if possible.
    // But store is global. I can import it.
    import('@/store/useMarkovStore').then(({ useMarkovStore }) => {
        const update = useMarkovStore.getState().updateTransitionProbability;
        const val = parseFloat(prob);
        if (!isNaN(val)) {
            update(id, Math.max(0, Math.min(1, val))); // update store & system
            setProb(val.toFixed(2));
        } else {
            setProb(data?.probability?.toFixed(2));
        }
    });

    setEdges((edges) =>
      edges.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            data: { ...e.data, probability: parseFloat(prob) },
          };
        }
        return e;
      })
    );
  };

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      setProb(evt.target.value);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
            style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                fontSize: 12,
                pointerEvents: 'all',
            }}
            className="nodrag nopan"
        >
            {isEditing ? (
                <input
                    className="w-16 bg-[#0A0C10] border border-[#4CAF50] text-[#E0E5EC] px-1 py-0.5 rounded text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    value={prob}
                    onChange={handleInputChange}
                    onBlur={onBlur}
                    autoFocus
                />
            ) : (
                <button 
                    className="bg-[#0A0C10] border border-[#E0E5EC]/20 text-[#E0E5EC]/80 px-2 py-0.5 rounded shadow-sm hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors"
                    onClick={(e) => onEdgeClick(e, id)}
                >
                    {data?.probability?.toFixed(2) || '0.50'}
                </button>
            )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default SeveranceEdge;
