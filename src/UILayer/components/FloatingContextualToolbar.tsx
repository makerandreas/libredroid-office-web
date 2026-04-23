import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditorState } from '../context/EditorContext';

export function FloatingContextualToolbar() {
  const { module, selectionType, fctPosition, setFctPosition, setSelectionType, documentData } = useEditorState();

  if (!fctPosition || selectionType === 'none') return null;

  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(documentData || {}));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "libredroid-document.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const renderTools = () => {
    const Separator = () => <div className="w-[1px] h-5 bg-outline/30 mx-1 shrink-0" />;
    const ToolBtn = ({ icon, label, onClick }: { icon: string, label?: string, onClick?: () => void }) => (
      <button 
        onClick={onClick} 
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant text-on-surface transition-colors" 
        title={label}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </button>
    );

    const moreBtn = <ToolBtn icon="more_vert" label="More options" />;
    const commonText = (
      <>
        <ToolBtn icon="content_cut" label="Cut" />
        <ToolBtn icon="content_copy" label="Copy" />
        <ToolBtn icon="content_paste" label="Paste" />
        <ToolBtn icon="delete" label="Delete" />
        <Separator />
        {moreBtn}
      </>
    );

    if (selectionType === 'table') {
      return (
        <>
          <ToolBtn icon="edit_note" label="Edit Cell" />
          <ToolBtn icon="table_rows" label="Insert Row" />
          <ToolBtn icon="format_color_fill" label="Table Styles" />
          <Separator />
          <ToolBtn icon="save" label="Save Changes" onClick={handleSave} />
          <Separator />
          {moreBtn}
        </>
      );
    }

    if (module === 'calc') {
      if (selectionType === 'calc_multi_range') {
         return (
           <>
             <ToolBtn icon="deselect" label="Clear selection" />
             <ToolBtn icon="delete" label="Delete" />
             <ToolBtn icon="add_comment" label="Comment" />
             <ToolBtn icon="format_paint" label="Fill mode" />
             <Separator />
             <ToolBtn icon="save" label="Save Changes" onClick={handleSave} />
             <Separator />
             {moreBtn}
           </>
         );
      } else if (selectionType === 'calc_single_cell') {
         return (
           <>
             <ToolBtn icon="content_cut" />
             <ToolBtn icon="content_copy" />
             <ToolBtn icon="content_paste" />
             <ToolBtn icon="delete" />
             <Separator />
             <ToolBtn icon="add_comment" label="Comment" />
             <ToolBtn icon="format_paint" label="Fill mode" />
             <ToolBtn icon="select_all" label="Multi-selection" />
             <Separator />
             <ToolBtn icon="save" label="Save Changes" onClick={handleSave} />
             <Separator />
             {moreBtn}
           </>
         );
      }
    }
    
    // Writer / Impress text default or fallback
    return (
      <>
        {commonText}
        <Separator />
        <ToolBtn icon="save" label="Save Changes" onClick={handleSave} />
      </>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{ 
          left: fctPosition.x, 
          top: fctPosition.y - 65, 
          transform: 'translateX(-50%)' 
        }}
        className="absolute z-50 flex items-center bg-white border border-outline/20 rounded-full shadow-lg p-1.5"
      >
        {renderTools()}
        
        {/* Helper close button to demock selection */}
        <button 
          onClick={() => { setFctPosition(null); setSelectionType('none'); }} 
          className="absolute -top-1 -right-1 bg-error text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm hover:scale-110 transition-transform"
        >
           <span className="material-symbols-outlined text-[10px]">close</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
