import React, { useCallback, useState } from 'react';
import { useEditorState, ModuleType } from '../context/EditorContext';
import * as mammoth from 'mammoth';
import { read, utils } from 'xlsx';

// Need to pass the navigation hook to jump to parsed view
export function DropZone({ onNavigate }: { onNavigate?: (mod: ModuleType) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const { setDocumentData, isParsing, setIsParsing } = useEditorState();

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    
    setIsParsing(true);
    // Simple artificial UI delay to show progress state on super fast computers
    await new Promise(r => setTimeout(r, 600)); 
    
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    console.log(`[Parser Core] Starting parsing for ${file.name}`);
    console.time('parse-' + file.name);

    try {
      if (ext === '.docx' || ext === '.doc') {
        const buffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setDocumentData(result.value);
        if (onNavigate) onNavigate('writer');
      } 
      else if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
        const buffer = await file.arrayBuffer();
        // Load with limits to preserve memory on 2GB devices
        const wb = read(buffer, { type: 'array', cellDates: true, cellFormula: false });
        
        const sheetsData = wb.SheetNames.map(name => {
           return {
              name,
              data: utils.sheet_to_json(wb.Sheets[name], { header: 1 })
           };
        });

        setDocumentData(sheetsData);
        if (onNavigate) onNavigate('calc');
      }
      else if (ext === '.pptx' || ext === '.ppt') {
        // Mock impress since there's no perfect pptx->html open source library that rivals Libre
        setDocumentData("RAW_PPT_DATA_STUB");
        if (onNavigate) onNavigate('impress');
      } else {
        alert("Unsupported file type. Use .docx, .xlsx, or .pptx.");
      }
    } catch (e) {
      console.error("Error parsing file:", e);
      alert("Error parsing file: " + e);
    } finally {
      console.timeEnd('parse-' + file.name);
      setIsParsing(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isParsing) setIsDragging(true);
  }, [isParsing]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isParsing && e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [isParsing]);

  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-full h-64 rounded-[28px] border-2 border-dashed transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12 cursor-pointer
        ${isDragging 
          ? 'border-primary bg-primary-container scale-[1.01]' 
          : 'border-primary/50 bg-[var(--md-sys-color-surface-variant)] hover:bg-[var(--md-sys-color-primary-container)]'
        } ${isParsing ? 'pointer-events-none opacity-80' : ''}`}
    >
      {isParsing ? (
        <div className="flex flex-col items-center justify-center w-full max-w-[240px]">
           <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
             <span className="material-symbols-outlined text-primary text-3xl z-10 animate-spin">sync</span>
           </div>
           <h3 className="text-xl font-medium text-on-background mb-4">Parsing Document...</h3>
           {/* Geometric Balance Progress Bar */}
           <div className="w-full h-2 bg-outline/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out w-2/3 animate-pulse"></div>
           </div>
        </div>
      ) : (
        <>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 mb-6 transition-colors duration-300
            ${isDragging ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container'}`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
          </div>
          
          <div className="flex-1 text-center mt-2">
            <h3 className="text-xl font-medium text-on-background">
              {isDragging ? 'Drop file to open' : 'Drop files to open'}
            </h3>
            <p className="text-on-surface-variant mt-1 text-base">
              DOCX, XLSX, PPTX supported via WASM Core
            </p>
          </div>

          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".docx,.xlsx,.pptx,.doc,.xls,.ppt,.csv"
            onChange={(e) => {
               if (e.target.files) {
                 handleFileUpload(e.target.files);
               }
            }}
          />
        </>
      )}
    </div>
  );
}
