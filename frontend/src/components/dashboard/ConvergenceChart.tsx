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
    const simulationResult = useMarkovStore((s) => s.simulationResult);
    const runSimulation = useMarkovStore((s) => s.runSimulation);
    const nodes = useMarkovStore((s) => s.nodes);

    const onRun = () => {
        runSimulation(20);
    };

    // Transform data for Recharts
    const chartData = useMemo(() => {
        if (!simulationResult) return [];
        
        const { steps, distributions } = simulationResult;
        // Need to know which index corresponds to which node
        // In python backend, the order depends on how the matrix was built.
        // Usually assume same order as nodes array if sent correctly.
        // Ideally backend returns labels, or IDs in order.
        // Assuming backend returns distributions corresponding to the ID list used to build matrix.
        
        // Wait, backend build_system_from_json iterates nodes list from frontend request.
        // So the order should be the order in `nodes` array sent to backend.
        // If we trust that order is preserved:
        
        const names = nodes.map(n => n.data.label || n.id);

        return steps.map((step, i) => {
            const dist = distributions[i];
            const point: any = { step };
            if (dist) {
                if (names) {
                    names.forEach((name, idx) => {
                        point[name] = dist[idx];
                    });
                }
            }
            return point;
        });
    }, [simulationResult, nodes]);

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
                    Run Simulation
                </button>
            </div>

            {simulationResult ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E5EC" opacity={0.1} />
                            <XAxis dataKey="step" stroke="#E0E5EC" opacity={0.5} tick={{ fontSize: 10 }} />
                            <YAxis stroke="#E0E5EC" opacity={0.5} domain={[0, 1]} tick={{ fontSize: 10 }} />
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
