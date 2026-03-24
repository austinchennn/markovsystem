import React, { useMemo } from 'react';
import { useMarkovStore } from '@/store/useMarkovStore';
import clsx from 'clsx';

export const MatrixDisplay = () => {
    const nodes = useMarkovStore((state) => state.nodes);
    const edges = useMarkovStore((state) => state.edges);
    const updateEventName = useMarkovStore((state) => state.updateEventName);
    const upsertTransition = useMarkovStore((state) => state.upsertTransition);

    // Re-calculate matrix when nodes/edges change
    const { ids, matrix } = useMemo(() => {
        const idList = nodes.map(n => n.id);
        const n = idList.length;
        const idMap = new Map(idList.map((id, i) => [id, i]));
        
        // Initialize n x n matrix with 0
        const m = Array(n).fill(null).map(() => Array(n).fill(0));

        // Fill with probabilities from edges
        edges.forEach(edge => {
            const fromIdx = idMap.get(edge.source);
            const toIdx = idMap.get(edge.target);
            const prob = edge.data?.probability || 0;
            
            if (fromIdx !== undefined && toIdx !== undefined) {
                m[fromIdx][toIdx] = prob;
            }
        });

        return { ids: idList, matrix: m };
    }, [nodes, edges]);

    // Map IDs to Names for display
    const names = ids.map(id => nodes.find(n => n.id === id)?.data.label || id);

    const handleProbChange = (fromId: string, toId: string, value: string) => {
        const prob = parseFloat(value);
        // Only update if it's a valid number between 0 and 1
        if (!isNaN(prob) && prob >= 0 && prob <= 1) {
            upsertTransition(fromId, toId, prob);
        }
    };

    const handleNameChange = (id: string, newName: string) => {
        if (newName.trim()) {
            updateEventName(id, newName);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 font-mono text-sm bg-[#0A0C10] border border-[#E0E5EC]/20 rounded-lg shadow-sm">
            <h3 className="text-[#E0E5EC]/70 uppercase tracking-widest text-xs border-b border-[#E0E5EC]/10 pb-2 mb-2">
                Transition Matrix P
            </h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 text-[#E0E5EC]/40 font-normal">S \ S'</th>
                            {ids.map((id, i) => (
                                <th key={id} className="p-2 text-[#E0E5EC] font-normal border-b border-[#E0E5EC]/10 min-w-[60px]">
                                    <input 
                                        type="text"
                                        key={names[i]} // Force re-render on name change from outside
                                        defaultValue={names[i]}
                                        onBlur={(e) => handleNameChange(id, e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter') handleNameChange(id, e.currentTarget.value) }}
                                        className="bg-transparent text-right w-full outline-none border-b border-transparent focus:border-[#4CAF50] transition-colors"
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ids.map((fromId, i) => (
                            <tr key={fromId} className="hover:bg-[#E0E5EC]/5 transition-colors">
                                <td className="p-2 text-[#E0E5EC] font-normal border-r border-[#E0E5EC]/10 text-left min-w-[80px]">
                                     <input 
                                        type="text"
                                        key={names[i]} // Force re-render
                                        defaultValue={names[i]}
                                        onBlur={(e) => handleNameChange(fromId, e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter') handleNameChange(fromId, e.currentTarget.value) }}
                                        className="bg-transparent text-left w-full outline-none border-b border-transparent focus:border-[#4CAF50] transition-colors"
                                    />
                                </td>
                                {matrix[i].map((val, j) => (
                                    <td key={`${fromId}-${ids[j]}`} className="p-0 border border-[#E0E5EC]/5">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            defaultValue={val}
                                            key={val} // Force re-render on value change
                                            onBlur={(e) => handleProbChange(fromId, ids[j], e.target.value)}
                                            onKeyDown={(e) => { if(e.key === 'Enter') handleProbChange(fromId, ids[j], e.currentTarget.value) }}
                                            className={clsx(
                                                "w-full h-full py-2 pl-2 pr-5 bg-transparent text-right outline-none focus:bg-[#4CAF50]/10 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                                val === 0 ? "text-[#E0E5EC]/20" : "text-[#4CAF50]"
                                            )}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {ids.length === 0 && (
                <div className="text-center py-8 text-[#E0E5EC]/30 italic">
                    No active events in the system.
                </div>
            )}
        </div>
    );
};
