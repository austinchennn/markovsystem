import React, { useMemo } from 'react';
import { useMarkovStore } from '@/store/useMarkovStore';
import clsx from 'clsx';

export const MatrixDisplay = () => {
    const { system, events } = useMarkovStore((state) => ({
        system: state.system,
        events: state.nodes // using nodes as events proxy for reactivity
    }));

    // Re-calculate matrix when events/transitions change
    // Note: In a real app, we might want to trigger this explicitly or memoize better
    // because calculating matrix on every render might be expensive if very large.
    // For now, it's fine.
    const { ids, matrix } = useMemo(() => {
        return system.getTransitionMatrix();
    }, [system, events]); // events dependency to trigger re-render on structure change

    // Map IDs to Names for display
    const names = ids.map(id => system.events.get(id)?.name || id);

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
                            {names.map((name, i) => (
                                <th key={i} className="p-2 text-[#E0E5EC] font-normal border-b border-[#E0E5EC]/10 min-w-[60px]">
                                    {name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {names.map((rowName, i) => (
                            <tr key={i} className="hover:bg-[#E0E5EC]/5 transition-colors">
                                <td className="p-2 text-[#E0E5EC] font-normal border-r border-[#E0E5EC]/10 text-left">
                                    {rowName}
                                </td>
                                {matrix[i].map((val, j) => (
                                    <td key={j} className={clsx(
                                        "p-2",
                                        val === 0 ? "text-[#E0E5EC]/20" : "text-[#4CAF50]"
                                    )}>
                                        {val.toFixed(2)}
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
