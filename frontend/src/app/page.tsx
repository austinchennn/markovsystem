'use client';

import React from 'react';
import GraphCanvasWrapper from '@/components/canvas/GraphCanvas';
import { MatrixDisplay } from '@/components/dashboard/MatrixDisplay';
import { ConvergenceChart } from '@/components/dashboard/ConvergenceChart';
import { useMarkovStore } from '@/store/useMarkovStore';
import { Plus, AlertTriangle, Download, Trash2, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const addEvent = useMarkovStore(s => s.addEvent);
  const validateSystem = useMarkovStore(s => s.validateSystem);
  const resetSystem = useMarkovStore(s => s.resetSystem);
  const exportSystem = useMarkovStore(s => s.exportSystem);
  const [errorList, setErrorList] = React.useState<string[]>([]);
  const [sidebarWidth, setSidebarWidth] = React.useState(400);
  const isResizingRef = React.useRef(false);

  // Periodically validate (or via effect)
  React.useEffect(() => {
    const interval = setInterval(() => {
        // Validation now async and could return promise
        validateSystem().then(errors => setErrorList(errors));
    }, 2000);
    return () => clearInterval(interval);
  }, [validateSystem]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.max(300, Math.min(800, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleCreateNode = () => {
    const name = `E${Math.floor(Math.random() * 1000)}`;
    addEvent(name);
  };

  return (
    <main className="flex h-screen w-full bg-[#0A0C10] text-[#E0E5EC] overflow-hidden font-mono tracking-wide selection:bg-[#4CAF50]/30 selection:text-[#E0E5EC]">
      
      {/* Sidebar Controls */}
      <aside 
        style={{ width: sidebarWidth }}
        className="flex flex-col border-r border-[#E0E5EC]/10 bg-[#0f1115]/50 backdrop-blur-md shadow-[5px_0_30px_rgba(0,0,0,0.5)] z-20 shrink-0"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-[#E0E5EC]/10">
          <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-[#E0E5EC] flex items-center gap-2">
            <span className={clsx("w-2 h-2 rounded-full shadow-[0_0_8px]", errorList.length > 0 ? "bg-[#CF6679] shadow-[#CF6679]" : "bg-[#4CAF50] shadow-[#4CAF50] animate-pulse")}></span>
            MARKOV<span className="text-[#4CAF50] opacity-50">.SYSTEM</span>
          </h1>
          <div className="text-[10px] text-[#E0E5EC]/40 uppercase tracking-widest mt-1">
            Core Visualization // V1
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-6 border-b border-[#E0E5EC]/10 flex flex-col gap-3">
            <button
                onClick={handleCreateNode}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0A0C10] border border-[#E0E5EC]/20 text-[#E0E5EC] hover:border-[#4CAF50] hover:text-[#4CAF50] transition-all duration-300 active:scale-95 text-xs font-bold tracking-widest uppercase shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(76,175,80,0.1)]"
            >
                <Plus size={14} />
                Create Event Node
            </button>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
                 <button
                    onClick={() => { if(confirm("Clear all nodes and edges?")) resetSystem() }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#0A0C10] border border-[#E0E5EC]/20 text-[#CF6679] hover:border-[#CF6679] hover:bg-[#CF6679]/10 transition-all text-[10px] font-bold tracking-widest uppercase"
                    title="Clear System"
                >
                    <Trash2 size={12} />
                    Restart
                </button>
                <button
                    onClick={exportSystem}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#0A0C10] border border-[#E0E5EC]/20 text-[#E0E5EC] hover:border-[#E0E5EC] hover:bg-[#E0E5EC]/5 transition-all text-[10px] font-bold tracking-widest uppercase"
                    title="Export ZIP"
                >
                    <Download size={12} />
                    Export
                </button>
            </div>

            <div className="text-[10px] text-[#E0E5EC]/30 leading-relaxed px-2 border-l border-[#E0E5EC]/10 italic mt-2">
                Drag from green handles to connect. Click edge labels to edit probability. Outgoing sum must be 1.0.
            </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            <section>
                <h2 className="text-[10px] font-bold text-[#E0E5EC]/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#4CAF50] rounded-full"></span>
                    Transition Matrix
                </h2>
                <MatrixDisplay />
            </section>

            <section>
                <h2 className="text-[10px] font-bold text-[#E0E5EC]/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#4CAF50] rounded-full"></span>
                    Convergence Analysis
                </h2>
                <ConvergenceChart />
            </section>
        </div>

        {/* Footer Status */}
        <div className="p-3 border-t border-[#E0E5EC]/10 text-[9px] text-[#E0E5EC]/20 uppercase tracking-widest flex justify-between bg-[#050608]">
            <span className={errorList.length > 0 ? "text-[#CF6679]" : "text-[#4CAF50]"}>
                System Status: {errorList.length === 0 ? 'Optimal' : 'Checking'}
            </span>
            <span>v1.5.0-CORE</span>
        </div>
      </aside>

      {/* Resize Handle */}
      <div 
        className="w-1 hover:w-1.5 bg-[#ffffff]/5 hover:bg-[#4CAF50] cursor-col-resize transition-all duration-150 z-40 flex-shrink-0 active:bg-[#4CAF50]"
        onMouseDown={(e) => {
            e.preventDefault(); // Prevent text selection
            isResizingRef.current = true;
            document.body.style.cursor = 'col-resize';
        }}
      />

      {/* Graph Area */}
      <div className="flex-1 relative bg-[#0A0C10] overflow-hidden">
        <GraphCanvasWrapper />
        
        {/* Top Right Overlay: Errors & Status */}
        <div className="absolute top-6 right-6 flex flex-col items-end gap-4 pointer-events-none z-50">
            {errorList.length > 0 && (
                <div className="bg-[#0f1115]/95 border-l-2 border-[#CF6679] backdrop-blur-xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-5 pointer-events-auto max-w-md">
                    <h3 className="text-[#CF6679] text-xs font-bold tracking-widest mb-3 flex items-center gap-2 uppercase border-b border-[#CF6679]/20 pb-2">
                        <AlertTriangle size={14} />
                        System Error
                    </h3>
                    <ul className="space-y-2">
                        {errorList.map((err, i) => (
                            <li key={i} className="text-[#E0E5EC]/90 text-[11px] font-mono leading-relaxed">
                                <span className="text-[#CF6679] mr-2">ERROR_CODE_{i}:</span>{err}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="text-[10px] text-[#E0E5EC]/20 text-right uppercase tracking-[0.2em]">
                Secure Connection // REF: MKV-994
            </div>
        </div>
      </div>

    </main>
  );
}
