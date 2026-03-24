import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useMarkovStore } from '@/store/useMarkovStore';
import clsx from 'clsx';

const MarkovNode = ({ id, data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(data.label);
  
  // Use action from store without fetching whole state
  const updateEventName = useMarkovStore(s => s.updateEventName);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(data.label);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() !== "") {
        updateEventName(id, editValue);
    } else {
        setEditValue(data.label); // Revert on empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleBlur();
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={clsx(
        "relative flex items-center justify-center w-24 h-24 rounded-full border-2 transition-all duration-300 cursor-pointer overflow-hidden",
        selected ? "border-[#4CAF50] shadow-[0_0_15px_rgba(76,175,80,0.5)]" : "border-[#E0E5EC]/20 hover:border-[#E0E5EC]/50",
        "bg-[#0A0C10] text-[#E0E5EC] font-mono text-sm tracking-widest"
      )}
    >
      {/* Input Handle (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#E0E5EC] !w-2 !h-2 !border-none"
      />
      
      <div className="text-center px-1 truncate w-[80%] flex justify-center items-center h-full">
        {isEditing ? (
            <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="bg-transparent text-center w-full outline-none border-b border-[#4CAF50] text-[#E0E5EC]"
            />
        ) : (
            data.label
        )}
      </div>

      {/* Output Handle (Bottom - draggable point) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#4CAF50] !w-3 !h-3 !border-none hover:scale-125 transition-transform"
      />
    </div>
  );
};

export default memo(MarkovNode);
