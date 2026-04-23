import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  title: string;
  children: React.ReactNode;
}

export function MobileDialog({ isOpen, onClose, onApply, title, children }: MobileDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col bg-background"
        >
          {/* Header Block matching Phase 4 MobileDialog spec */}
          <header className="h-14 flex items-center justify-between px-3 border-b border-surface-variant bg-surface shrink-0 shadow-sm text-on-surface">
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
                aria-label="Back"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
              <h2 className="text-lg font-medium">{title}</h2>
            </div>
            
            <div className="flex items-center gap-1">
              {onApply && (
                <button 
                  onClick={onApply} 
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Apply
                </button>
              )}
              <button 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
                title="More options"
              >
                <span className="material-symbols-outlined text-[24px]">more_vert</span>
              </button>
            </div>
          </header>

          {/* Dialog Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar bg-surface-variant/20">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
