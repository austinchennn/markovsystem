// src/components/dashboard/ConvergenceChart.tsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMarkovStore } from '@/store/useMarkovStore';

export const ConvergenceChart = () => {
    // This needs to be triggered explicitly via store action
    // But for simplicity, we can auto-simulate on change or click a button
    // Let's rely on a state "simulationResult" if we had one.
    // For now, let's just create a button inside this component to trigger simulation.
    // Or compute it on the fly (expensive!).
    // Let's add a "Run Simulation" button.
    
    // We need to fetch system state from store
    const { system, events } = useMarkovStore((s) => ({ system: s.system, events: s.nodes }));
    const [simData, setSimData] = React.useState<{steps: number[], distributions: number[][]} | null>(null);

    const onRun = () => {
        // Run 20 steps
        // Initial state: Uniform
        const res = system.simulate(20);
        setSimData(res);
    };

    // Transform data for Recharts
    // Data format: [{ step: 0, EventA: 0.5, EventB: 0.5 }, { step: 1, ... }]
    const chartData = useMemo(() => {
        if (!simData) return [];
        
        const { steps, distributions } = simData;
        const { ids } = system.getTransitionMatrix(); // get names
        const names = ids.map(id => system.events.get(id)?.name || id);

        return steps.map((step, i) => {
            const dist = distributions[i];
            const point: any = { step };
            names.forEach((name, idx) => {
                point[name] = dist[idx];
            });
            return point;
        });
    }, [simData, system]);

    // Color palette for lines
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

    return (
        <div className="flex flex-col gap-4 p-4 mt-4 bg-[#0A0C10] border border-[#E0E5EC]/20 rounded-lg shadow-sm">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-[#E0E5EC]/70 uppercase tracking-widest text-xs">
                    Convergence Analysis
                </h3>
                <button 
                    onClick={onRun}
                    className="px-3 py-1 bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30 rounded text-xs hover:bg-[#4CAF50]/20 transition-all font-mono"
                >
                    RUN SIMULATION
                </button>
            </div>

            {simData ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E5EC" opacity={0.1} />
                            <XAxis dataKey="step" stroke="#E0E5EC" opacity={0.5} tick={{fontSize: 10}} />
                            <YAxis stroke="#E0E5EC" opacity={0.5} domain={[0, 1]} tick={{fontSize: 10}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0A0C10', borderColor: '#E0E5EC', color: '#E0E5EC' }} 
                                itemStyle={{ color: '#E0E5EC' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', opacity: 0.7 }} />
                            {Object.keys(chartData[0] || {}).filter(k => k !== 'step').map((key, i) => (
                                <Line 
                                    key={key} 
                                    type="monotone" 
                                    dataKey={key} 
                                    stroke={colors[i % colors.length]} 
                                    strokeWidth={2}
                                    dot={false} 
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-[#E0E5EC]/20 italic text-sm border border-dashed border-[#E0E5EC]/10 rounded">
                    Click "Run Simulation" to visualize convergence
                </div>
            )}
        </div>
    );
};
