import React, { useState } from 'react';
import { useEditorState } from '../context/EditorContext';
import { motion } from 'motion/react';

export function SimplifiedRibbon() {
  const { module, setIsRibbonOpen } = useEditorState();
  const [activeTab, setActiveTab] = useState('Home');

  // Ribbon tabs logic per Phase 4 requirements
  const tabs = ['File', 'Home', 'Insert'];
  if (module === 'impress') tabs.push('Design', 'Transition', 'Animation', 'Slide show');
  if (module === 'writer' || module === 'calc') tabs.push('Layout', 'Review');
  if (module === 'calc') tabs.push('Formula', 'Data');
  if (module === 'writer' || module === 'calc' || module === 'impress') tabs.push('View');

  const toolsForTab = (tab: string) => {
    switch(tab) {
      case 'Home':
         return ['content_cut', 'content_copy', 'content_paste', 'format_bold', 'format_italic', 'format_underlined', 'format_color_text', 'format_align_left', 'format_align_center', 'format_list_bulleted'];
      case 'Insert':
         return ['image', 'table_chart', 'shapes', 'insert_link', 'functions'];
      case 'Layout':
         return ['margin', 'view_column', 'calendar_view_day', 'format_indent_increase'];
      default:
         return ['more_horiz'];
    }
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="flex flex-col w-full bg-surface border-b border-outline overflow-hidden shrink-0 z-30"
    >
      <div className="flex items-center justify-between px-3 py-2">
         {/* Ribbon options drop-down */}
         <div className="flex items-center gap-1 cursor-pointer hover:bg-surface-variant px-2 py-1.5 rounded-[12px] transition-colors">
           <span className="text-sm font-semibold text-primary">Ribbon options</span>
           <span className="material-symbols-outlined text-primary text-[20px]">arrow_drop_down</span>
         </div>
         
         {/* Right side controls */}
         <div className="flex items-center gap-1">
           <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
             <span className="material-symbols-outlined text-[20px]">undo</span>
           </button>
           <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
             <span className="material-symbols-outlined text-[20px]">redo</span>
           </button>
           <div className="w-[1px] h-5 bg-outline/40 mx-1"></div>
           <button onClick={() => setIsRibbonOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary-container text-on-surface-variant hover:text-primary transition-colors" title="Hide simplified ribbon bar">
             <span className="material-symbols-outlined text-[24px]">keyboard_arrow_up</span>
           </button>
         </div>
      </div>
      
      {/* Tabs */}
      <div className="flex w-full overflow-x-auto no-scrollbar scroll-smooth px-3 items-center gap-6 border-b border-outline/20">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`text-sm font-medium whitespace-nowrap px-1 py-2 border-b-2 transition-colors
              ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tools Row */}
      <div className="flex w-full overflow-x-auto no-scrollbar scroll-smooth p-2 items-center gap-1 h-12">
        {toolsForTab(activeTab).map((icon, idx) => (
          <button 
             key={`${activeTab}-${icon}-${idx}`} 
             onClick={() => {
                if (icon === 'format_bold') document.execCommand('bold');
                else if (icon === 'format_italic') document.execCommand('italic');
                else if (icon === 'format_underlined') document.execCommand('underline');
             }}
             className="w-10 h-10 flex items-center justify-center rounded-[8px] hover:bg-surface-variant text-on-surface transition-colors shrink-0"
          >
             <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
