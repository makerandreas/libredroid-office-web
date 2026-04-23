import React, { useState } from 'react';
import { ModuleSelector } from './ModuleSelector';
import { DropZone } from './DropZone';
import { ModuleType } from '../context/EditorContext';
import { motion, AnimatePresence } from 'motion/react';

export function StartCenter({ onSelectModule, onNavigate }: { onSelectModule: (mod: ModuleType) => void, onNavigate?: (mod: ModuleType) => void }) {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const wasmInputRef = React.useRef<HTMLInputElement>(null);

  const handleWasmSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log("Selected WASM:", file.name);
        alert(`WASM module ${file.name} selected. Initialization simulation starting...`);
        // Here we'd map to a global loader
     }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      {/* Header / Modular Toolbar Preview */}
      <header className="h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between border-b border-outline bg-white shrink-0 relative z-20">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
          <h2 className="text-base sm:text-lg font-medium text-on-surface pr-2 sm:pr-4">Start Center</h2>
          <div className="h-8 w-[1px] bg-outline hidden sm:block"></div>
          
          <div className="relative">
            <button 
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              className="px-3 sm:px-4 py-1.5 rounded-full border border-outline text-xs sm:text-sm font-medium hover:bg-surface-variant flex items-center gap-2 text-on-surface shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add</span>
              New Doc
            </button>
            <AnimatePresence>
                {isNewMenuOpen && (
                   <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-12 left-0 w-36 bg-surface shadow-lg rounded-xl border border-outline/20 p-2 flex flex-col gap-1 z-50"
                   >
                     <button onClick={() => { onSelectModule('writer'); setIsNewMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-variant rounded-md flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> Writer
                     </button>
                     <button onClick={() => { onSelectModule('calc'); setIsNewMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-variant rounded-md flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Calc
                     </button>
                     <button onClick={() => { onSelectModule('impress'); setIsNewMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-variant rounded-md flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span> Impress
                     </button>
                   </motion.div>
                )}
            </AnimatePresence>
          </div>

          <button 
             onClick={() => wasmInputRef.current?.click()}
             className="px-3 sm:px-4 py-1.5 rounded-full bg-primary-container text-on-surface text-xs sm:text-sm font-medium flex items-center gap-2 hover:bg-primary-container/80 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">download</span>
            Import WASM
          </button>
          <input 
             type="file" 
             accept=".wasm" 
             className="hidden" 
             ref={wasmInputRef}
             onChange={handleWasmSelect}
          />
          <button className="hidden sm:block px-4 py-1.5 rounded-full border border-outline text-sm font-medium hover:bg-surface-variant text-on-surface shrink-0">HarfBuzz</button>
          <button className="hidden sm:block px-4 py-1.5 rounded-full border border-outline text-sm font-medium hover:bg-surface-variant text-on-surface shrink-0">KaTeX</button>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2 sm:ml-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs sm:text-sm font-bold">JD</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-10 flex flex-col gap-6 sm:gap-10 flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* Header / Intro */}
        <section className="flex flex-col gap-1 sm:gap-2">
          <h1 className="text-2xl sm:text-4xl font-normal text-on-background tracking-tight">Welcome to LibreDroid</h1>
          <p className="text-on-surface-variant text-sm sm:text-lg">High-performance office productivity powered by WebAssembly.</p>
        </section>

        {/* Drop Zone for existing documents */}
        <section>
          <DropZone onNavigate={onNavigate} />
        </section>

        {/* Application Modules Grid */}
        <section>
          <ModuleSelector onSelect={onSelectModule} />
        </section>
      </main>
    </div>
  );
}
