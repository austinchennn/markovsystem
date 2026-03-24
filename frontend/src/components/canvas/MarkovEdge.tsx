import React, { useState, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
  MarkerType
} from 'reactflow';
import { useMarkovStore } from '@/store/useMarkovStore';

// Custom path for self-loops (node pointing to itself)
const getSelfLoopPath = (
    sourceX: number,
    sourceY: number, 
    targetX: number, 
    targetY: number
): [string, number, number] => {
  // Use a much larger and more exaggerated curve
  const radius = 100; // Increased radius
  const offset = 40;  // Vertical offset
  
  // Control points
  // Expand further out to the right
  const c1x = sourceX + radius;
  const c1y = sourceY + offset;
  const c2x = targetX + radius;
  const c2y = targetY - offset;
  
  // M start C c1 c2 end
  const path = `M ${sourceX} ${sourceY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetX} ${targetY}`;
  
  // Label position pushed further out
  const labelX = sourceX + radius + 10; 
  const labelY = (sourceY + targetY) / 2;
  
  return [path, labelX, labelY];
};

// Path for self-loop when user is dragging the label
const getDraggingSelfLoopPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  targetLabelX: number,
  targetLabelY: number
): [string, number, number] => {
  const dx = targetLabelX - sourceX; // Should technically be mid-point? Source and Target are usually close.
  const dy = targetLabelY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 1) return getSelfLoopPath(sourceX, sourceY, targetX, targetY); // fallback
  
  // Normalized direction vector relative to source
  const nx = dx / dist;
  const ny = dy / dist;
  
  // Perpendicular vector for width of the loop
  const px = -ny;
  const py = nx;
  
  const k = 4/3;
  const spread = Math.max(40, dist * 0.4); 

  const c1x = sourceX + nx * (dist * k) + px * spread;
  const c1y = sourceY + ny * (dist * k) + py * spread;
  
  const c2x = targetX + nx * (dist * k) - px * spread;
  const c2y = targetY + ny * (dist * k) - py * spread;
  
  const path = `M ${sourceX} ${sourceY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetX} ${targetY}`;
  
  return [path, targetLabelX, targetLabelY];
};

const getDraggingQuadraticPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  labelX: number,
  labelY: number
): [string, number, number] => {
    // We want a Quadratic Bezier M S Q C T such that at t=0.5, P=Label.
    // P(0.5) = 0.25*S + 0.5*C + 0.25*T
    // Label = 0.25*(S+T) + 0.5*C
    // 2*Label = 0.5*(S+T) + C
    // C = 2*Label - 0.5*(S+T)
    
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    
    const controlX = 2 * labelX - midX;
    const controlY = 2 * labelY - midY;
    
    const path = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
    
    return [path, labelX, labelY];
};

// Custom path for bidirectional edges to avoid overlap
const getCurvedPath = (
    sourceX: number, 
    sourceY: number, 
    targetX: number, 
    targetY: number,
    offset: number
): [string, number, number] => {
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;
    
    // Vector from Source to Target
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len === 0) return ["", 0, 0];

    // Perpendicular vector (rotate 90 deg)
    const nx = -dy / len;
    const ny = dx / len;
    
    // Control point
    const controlX = centerX + nx * offset;
    const controlY = centerY + ny * offset;
    
    const path = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
    
    // Label at t=0.5 of Quadratic Bezier
    const labelX = 0.25 * sourceX + 0.5 * controlX + 0.25 * targetX;
    const labelY = 0.25 * sourceY + 0.5 * controlY + 0.25 * targetY;
  
    return [path, labelX, labelY];
};

const MarkovEdge = ({
  id,
  source,
  target,
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
  const { getEdges } = useReactFlow();
  const edges = getEdges();
  const upsertTransition = useMarkovStore(s => s.upsertTransition);

  // -- State for Edit --
  const [isEditing, setIsEditing] = useState(false);
  const initialProb = data?.probability !== undefined ? Number(data.probability).toFixed(2) : '0.50';
  const [localProb, setLocalProb] = useState(initialProb);

  // -- State for Drag --
  const labelRef = React.useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);

  // -- Path Calculation --
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  // 1. Initial Logic
  if (source === target) {
      [edgePath, labelX, labelY] = getSelfLoopPath(sourceX, sourceY, targetX, targetY);
  } else {
      const reverseEdge = edges.find(e => e.source === target && e.target === source);
      if (reverseEdge) {
          const offset = 40;
          [edgePath, labelX, labelY] = getCurvedPath(sourceX, sourceY, targetX, targetY, offset);
      } else {
           [edgePath, labelX, labelY] = getBezierPath({
            sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
          });
      }
  }

  // 2. Drag Logic Override
  if (dragOffset.x !== 0 || dragOffset.y !== 0) {
      const targetLabelX = labelX + dragOffset.x;
      const targetLabelY = labelY + dragOffset.y;
      
      if (source === target) {
          [edgePath, labelX, labelY] = getDraggingSelfLoopPath(sourceX, sourceY, targetX, targetY, targetLabelX, targetLabelY);
      } else {
          [edgePath, labelX, labelY] = getDraggingQuadraticPath(sourceX, sourceY, targetX, targetY, targetLabelX, targetLabelY);
      }
      // Note: labelX/Y are now updated to be the dragged position derived from the new path.
      // So we render at labelX, labelY directly.
  }

  // -- Handlers --
  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
      setIsEditing(false);
      const val = parseFloat(localProb);
      if (!isNaN(val) && val >= 0 && val <= 1) {
          upsertTransition(source, target, val);
      } else {
          setLocalProb(initialProb);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleBlur();
  };

  const startDrag = (e: React.MouseEvent) => {
      if (isEditing) return;
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const initialOffsetX = dragOffset.x;
      const initialOffsetY = dragOffset.y;
      isDragging.current = true;

      const onMouseMove = (moveEvent: MouseEvent) => {
          if (!isDragging.current) return;
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          setDragOffset({ x: initialOffsetX + deltaX, y: initialOffsetY + deltaY });
      };
      
      const onMouseUp = () => {
          isDragging.current = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          ref={labelRef}
          onMouseDown={startDrag}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            zIndex: 10,
            pointerEvents: 'all',
            cursor: isEditing ? 'text' : 'grab',
          }}
          className="nodrag nopan"
          title="Drag to reposition label"
        >
          {isEditing ? (
              <input
                autoFocus
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-16 h-6 text-center text-xs bg-[#0A0C10] text-[#4CAF50] border border-[#4CAF50] rounded focus:outline-none"
                value={localProb}
                onChange={(e) => setLocalProb(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
          ) : (
            <button
                className="px-2 py-1 rounded bg-[#0A0C10] border border-[#E0E5EC]/20 text-[#E0E5EC] text-[10px] hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors shadow-sm"
                onClick={onEdgeClick}
            >
                {Number(localProb).toFixed(2)}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default MarkovEdge;

