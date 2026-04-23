import React from 'react';
import { motion } from 'motion/react';

const modules = [
  {
    id: 'writer',
    name: 'LibreDroid Writer',
    desc: 'Advanced word processing with complex text layout.',
    icon: 'edit_document',
    color: 'bg-blue-100', // the icon container bg
    textColor: 'text-blue-700' // icon color
  },
  {
    id: 'calc',
    name: 'LibreDroid Calc',
    desc: 'Powerful spreadsheet analysis with multi-threaded WASM.',
    icon: 'table_view',
    color: 'bg-green-100',
    textColor: 'text-green-700'
  },
  {
    id: 'impress',
    name: 'LibreDroid Impress',
    desc: 'High-fidelity presentations with smooth GPU rendering.',
    icon: 'slideshow',
    color: 'bg-orange-100',
    textColor: 'text-orange-700'
  }
];

export function ModuleSelector({ onSelect }: { onSelect: (mod: 'writer' | 'calc' | 'impress') => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {modules.map((mod, idx) => (
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          key={mod.id}
          onClick={() => onSelect(mod.id as any)}
          className={`flex flex-col p-6 rounded-[28px] border border-outline bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left gap-4 group`}
        >
          <div className={`${mod.color} w-12 h-12 rounded-xl flex items-center justify-center ${mod.textColor} shrink-0`}>
            {mod.id === 'writer' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>}
            {mod.id === 'calc' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 16H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V8h12v2z"/></svg>}
            {mod.id === 'impress' && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-on-background">{mod.name}</h3>
            <p className="text-on-surface-variant text-sm mt-1">{mod.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
