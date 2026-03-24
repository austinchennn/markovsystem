import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import clsx from 'clsx';

const MarkovNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center w-24 h-24 rounded-full border-2 transition-all duration-300",
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
      
      <div className="text-center px-1 truncate max-w-full">
        {data.label}
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
