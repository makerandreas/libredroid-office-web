import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StartCenter } from './UILayer/components/StartCenter';
import { EditorView } from './UILayer/components/EditorView';
import { EditorProvider, useEditorState, ModuleType } from './UILayer/context/EditorContext';
import { MobileDialog } from './UILayer/components/MobileDialog';

type ViewState = 'splash' | 'start' | 'writer' | 'calc' | 'impress';

function AppContent() {
  const [view, setView] = useState<ViewState>('splash');
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);
  const { setModule, setDocumentData } = useEditorState();

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setView('start');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNav = (newView: ViewState) => {
    setView(newView);
    if (newView === 'writer' || newView === 'calc' || newView === 'impress') {
      setModule(newView);
    } else {
      setModule(null);
      if (newView === 'start') {
         setDocumentData(null); // Clean Slate Logic implemented!
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-hidden font-sans flex">
      <AnimatePresence mode="wait">
        {view === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.2, 0.0, 0, 1.0] }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-surface"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center"
            >
              {/* LibreDroid Logo Placeholder */}
              <div className="w-24 h-24 rounded-[28px] bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 relative overflow-hidden">
                <span className="material-symbols-outlined text-on-primary text-5xl z-10 filled">
                  description
                </span>
                <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-primary-container rounded-full opacity-30"></div>
                <div className="absolute bottom-[-5px] left-[-5px] w-8 h-8 justify-center flex items-center bg-white/20 rounded-full"></div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">LibreDroid</h1>
              <p className="text-outline mt-2 tracking-widest text-sm uppercase">Office</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Material 3 Navigation Rail */}
      {view !== 'splash' && (
        <nav className="w-[72px] sm:w-24 bg-surface-variant border-r border-outline flex flex-col items-center py-6 sm:py-8 gap-8 sm:gap-10 shrink-0 relative z-20 transition-all">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-2xl flex items-center justify-center shadow-md text-on-primary cursor-pointer hover:bg-primary/90 transition-transform hover:scale-105" onClick={() => handleNav('start')}>
             <span className="material-symbols-outlined filled text-2xl sm:text-3xl">description</span>
          </div>
          <div className="flex flex-col gap-6 sm:gap-8 items-center w-full px-2">
            <div className="flex flex-col items-center gap-1 group cursor-pointer w-full" onClick={() => handleNav('writer')}>
              <div className={`w-12 h-8 sm:w-14 rounded-full flex items-center justify-center transition-colors ${view === 'writer' ? 'bg-primary-container text-on-primary-container border border-primary/20' : 'hover:bg-primary-container text-on-surface-variant group-hover:text-on-primary-container'}`}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="scale-[0.8] sm:scale-100"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-on-surface hidden sm:block">Writer</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer w-full" onClick={() => handleNav('calc')}>
              <div className={`w-12 h-8 sm:w-14 rounded-full flex items-center justify-center transition-colors ${view === 'calc' ? 'bg-primary-container text-on-primary-container border border-primary/20' : 'hover:bg-primary-container text-on-surface-variant group-hover:text-on-primary-container'}`}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="scale-[0.8] sm:scale-100"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-on-surface hidden sm:block">Calc</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer w-full" onClick={() => handleNav('impress')}>
              <div className={`w-12 h-8 sm:w-14 rounded-full flex items-center justify-center transition-colors ${view === 'impress' ? 'bg-primary-container text-on-primary-container border border-primary/20' : 'hover:bg-primary-container text-on-surface-variant group-hover:text-on-primary-container'}`}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="scale-[0.8] sm:scale-100"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-on-surface hidden sm:block">Impress</span>
            </div>
          </div>
          <div className="mt-auto mb-4">
            <div 
               onClick={() => setIsSystemInfoOpen(true)}
               className="w-12 h-8 sm:w-14 rounded-full flex items-center justify-center hover:bg-primary-container cursor-pointer text-on-surface-variant hover:text-on-primary-container transition-colors"
            >
               <span className="material-symbols-outlined filled text-xl sm:text-2xl">settings</span>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          {view === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col overflow-auto bg-background"
            >
              <StartCenter onSelectModule={(m) => {
                 if (m === 'writer') setDocumentData("<p><br/></p>");
                 else if (m === 'calc') setDocumentData([{ name: 'Sheet1', data: Array.from({length: 20}, () => Array(8).fill('')) }]);
                 else if (m === 'impress') setDocumentData("RAW_PPT_DATA_STUB");
                 handleNav(m);
              }} onNavigate={handleNav} />
            </motion.div>
          )}

          {(view === 'writer' || view === 'calc' || view === 'impress') && (
            <motion.div
              key={`editor-${view}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col bg-background z-10"
            >
              <EditorView onBack={() => handleNav('start')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileDialog 
         isOpen={isSystemInfoOpen} 
         onClose={() => setIsSystemInfoOpen(false)} 
         title="About LibreDroid"
      >
        <div className="flex flex-col gap-4 font-mono text-xs sm:text-sm text-on-surface-variant h-full overflow-y-auto w-full max-w-md mx-auto">
          <div className="flex justify-between items-center bg-surface w-full p-4 rounded-xl border border-outline/20">
             <span>WASM Bridge:</span> 
             <span className="text-green-600 font-bold tracking-tight">Connected</span>
          </div>
          <div className="flex justify-between items-center bg-surface w-full p-4 rounded-xl border border-outline/20">
             <span>HarfBuzz:</span> 
             <span className="text-primary font-bold tracking-tight">Active</span>
          </div>
          <div className="flex justify-between items-center bg-surface w-full p-4 rounded-xl border border-outline/20">
             <span>Equation Engine:</span> 
             <span>KaTeX 0.16</span>
          </div>
          <div className="flex justify-between items-center bg-surface w-full p-4 rounded-xl border border-outline/20 mt-4">
             <span>LibreOffice Core:</span> 
             <span>v7.6.4</span>
          </div>
          <div className="flex justify-between items-center bg-surface w-full p-4 rounded-xl border border-outline/20">
             <span>UI System:</span> 
             <span>M3 Expressive v1.0</span>
          </div>
        </div>
      </MobileDialog>
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  );
}
