import React, { useRef, useState, useEffect } from 'react';
import { EditorProvider, useEditorState, SelectionType } from '../context/EditorContext';
import { SimplifiedRibbon } from './SimplifiedRibbon';
import { FloatingContextualToolbar } from './FloatingContextualToolbar';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'motion/react';

interface EditorViewProps {
  onBack: () => void;
}

// Extracted Memoized Calc Table Component to prevent OOM / massive rendering
const CalcTableRender = React.memo<{
    sheetData: any[];
    activeCellCoords: {row: number, col: number} | null;
    formulaValue: string;
    onCellSelect: (rIdx: number, cIdx: number, cell: any, e: React.MouseEvent) => void;
}>(({ sheetData, activeCellCoords, formulaValue, onCellSelect }) => {
    
    // Calculate required headers (A, B, C...)
    const maxCols = Math.max(...sheetData.map(r => r ? r.length : 0), 1);
    const colHeaders = Array.from({ length: maxCols }).map((_, i) => {
        let n = i;
        let name = '';
        while (n >= 0) {
            name = String.fromCharCode(65 + (n % 26)) + name;
            n = Math.floor(n / 26) - 1;
        }
        return name;
    });

    return (
        <table className="w-full border-collapse border border-outline/30 text-xs sm:text-sm">
            <thead>
                <tr>
                    <th className="bg-surface-variant border border-outline/30 w-10 sticky top-0 left-0 z-30"></th>
                    {colHeaders.map((col, i) => (
                        <th key={i} className="bg-surface-variant text-outline border border-outline/30 px-2 py-1 font-medium sticky top-0 z-20 min-w-[80px]">
                            {col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {sheetData.map((row: any[], rIdx: number) => (
                   <tr key={rIdx}>
                     <th className="bg-surface-variant border border-outline/30 text-outline px-2 py-1 sticky left-0 z-20 font-medium select-none cursor-default">
                        {rIdx + 1}
                     </th>
                     {row.map((cell: any, cIdx: number) => {
                       const isSelected = activeCellCoords?.row === rIdx && activeCellCoords?.col === cIdx;
                       return (
                         <td 
                           key={cIdx} 
                           onClick={(e) => onCellSelect(rIdx, cIdx, cell, e)}
                           className={`border p-2 text-on-surface whitespace-nowrap min-w-[80px] cursor-cell transition-colors
                             ${isSelected ? 'bg-primary/10 border border-primary relative z-10 border-[2px]' : 'border-outline/30 hover:bg-surface-variant'}
                           `}
                         >
                           {isSelected ? formulaValue : cell}
                         </td>
                       );
                     })}
                   </tr>
                ))}
            </tbody>
        </table>
    );
});

function EditorLayout({ onBack }: { onBack: () => void }) {
  const { module, isRibbonOpen, setIsRibbonOpen, setSelectionType, setFctPosition, documentData, setDocumentData } = useEditorState();
  const containerRef = useRef<HTMLDivElement>(null);
  const writerEditTimeout = useRef<NodeJS.Timeout | null>(null);
  const calcEditTimeout = useRef<NodeJS.Timeout | null>(null);
  const isWriterInternalChange = useRef(false);

  // Writer Uncontrolled Ref
  const writerRef = useRef<HTMLDivElement>(null);
  const lastPushedData = useRef<string | null>(null);

  // Calc Specific State
  const [activeCellCoords, setActiveCellCoords] = useState<{row: number, col: number} | null>(null);
  const [formulaValue, setFormulaValue] = useState("");
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);

  // Calc Data Parser for Multi-Sheet
  const isMultiSheet = Array.isArray(documentData) && documentData.length > 0 && documentData[0].name !== undefined;
  const currentSheetData = isMultiSheet ? documentData[activeSheetIdx]?.data : (Array.isArray(documentData) ? documentData : null);

  // Equation Editor State
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [eqText, setEqText] = useState("\\sum_{i=1}^n x_i");
  const eqPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (isEqOpen && eqPreviewRef.current) {
        try {
           katex.render(eqText || "\\text{Type equation...}", eqPreviewRef.current, {
              throwOnError: false,
              displayMode: true
           });
        } catch(e) {}
     }
  }, [eqText, isEqOpen]);

  // Writer Composition State
  const isComposing = useRef(false);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    isComposing.current = false;
    handleWriterInput(e as unknown as React.FormEvent<HTMLDivElement>);
  };

  // Writer Uncontrolled HTML Injector
  useEffect(() => {
     if (module === 'writer' && writerRef.current) {
        if (typeof documentData === 'string' && documentData !== lastPushedData.current) {
           writerRef.current.innerHTML = documentData || '<p><br/></p>';
           lastPushedData.current = documentData;
        }
     }
  }, [documentData, module]);

  const getThemeColor = () => {
    switch (module) {
      case 'writer': return 'text-[var(--writer-color)]';
      case 'calc': return 'text-[var(--calc-color)]';
      case 'impress': return 'text-[var(--impress-color)]';
    }
  };

  const getToolbarItems = () => {
    const common = [
      { id: 'undo', icon: 'undo' },
      { id: 'redo', icon: 'redo' },
      { id: 'separator1', isSeparator: true },
      { id: 'bold', icon: 'format_bold' },
      { id: 'italic', icon: 'format_italic' },
      { id: 'underline', icon: 'format_underlined' },
      { id: 'strikethrough', icon: 'format_strikethrough' },
      { id: 'textcolor', icon: 'format_color_text' },
      { id: 'highlight', icon: 'format_ink_highlighter' },
      { id: 'separator2', isSeparator: true },
      { id: 'alignleft', icon: 'format_align_left' },
      { id: 'aligncenter', icon: 'format_align_center' },
      { id: 'alignright', icon: 'format_align_right' },
      { id: 'alignjustify', icon: 'format_align_justify' },
      { id: 'listbullet', icon: 'format_list_bulleted' },
      { id: 'listnumber', icon: 'format_list_numbered' },
    ];
    return common;
  };

  const handleDocumentClick = (e: React.MouseEvent) => {
     if (containerRef.current) {
        const target = e.target as HTMLElement;
        const rect = containerRef.current.getBoundingClientRect();
        const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        if (target.closest('td') || target.closest('th') || target.closest('table')) {
           setSelectionType('table');
           setFctPosition(pos);
           return;
        }

        // Check if double click simulated
        if (e.detail === 2) {
           let type: SelectionType = 'text';
           if (module === 'calc') type = 'calc_multi_range';
           setSelectionType(type);
           setFctPosition(pos);
        } else if (e.detail === 1 && module === 'calc') {
           setSelectionType('calc_single_cell');
           setFctPosition(pos);
        } else {
           setSelectionType('none');
           setFctPosition(null);
        }
     }
  };

  const handleWriterInput = (e: React.FormEvent<HTMLDivElement>) => {
      if (isComposing.current) return;
      isWriterInternalChange.current = true;
      const html = e.currentTarget.innerHTML;
      if (writerEditTimeout.current) clearTimeout(writerEditTimeout.current);
      writerEditTimeout.current = setTimeout(() => {
          setDocumentData(html);
      }, 500); // 500ms debounce to save RAM allocations
  };

  const handleCellSelect = React.useCallback((rIdx: number, cIdx: number, val: any, e: React.MouseEvent) => {
      e.stopPropagation(); // stop document click override
      setActiveCellCoords({row: rIdx, col: cIdx});
      setFormulaValue(val !== undefined && val !== null ? String(val) : "");
      
      const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      setSelectionType('calc_single_cell');
      setFctPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [setSelectionType, setFctPosition]);

  const commitFormulaValue = () => {
      if (calcEditTimeout.current) {
          clearTimeout(calcEditTimeout.current);
          calcEditTimeout.current = null;
      }
      
      if (activeCellCoords && currentSheetData) {
          const newDataObj = [...documentData];
          if (isMultiSheet) {
              const sheetData = [...newDataObj[activeSheetIdx].data];
              if (!sheetData[activeCellCoords.row]) sheetData[activeCellCoords.row] = [];
              sheetData[activeCellCoords.row] = [...sheetData[activeCellCoords.row]];
              sheetData[activeCellCoords.row][activeCellCoords.col] = formulaValue;
              newDataObj[activeSheetIdx] = { ...newDataObj[activeSheetIdx], data: sheetData };
          } else {
              if (!newDataObj[activeCellCoords.row]) newDataObj[activeCellCoords.row] = [];
              newDataObj[activeCellCoords.row] = [...newDataObj[activeCellCoords.row]];
              newDataObj[activeCellCoords.row][activeCellCoords.col] = formulaValue;
          }
          setDocumentData(newDataObj);
      }
  };

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormulaValue(val);
      if (activeCellCoords && currentSheetData) {
          const newDataObj = [...documentData];
          if (isMultiSheet) {
              const sheetData = [...newDataObj[activeSheetIdx].data];
              if (!sheetData[activeCellCoords.row]) sheetData[activeCellCoords.row] = [];
              sheetData[activeCellCoords.row] = [...sheetData[activeCellCoords.row]];
              sheetData[activeCellCoords.row][activeCellCoords.col] = val;
              newDataObj[activeSheetIdx] = { ...newDataObj[activeSheetIdx], data: sheetData };
          } else {
              if (!newDataObj[activeCellCoords.row]) newDataObj[activeCellCoords.row] = [];
              newDataObj[activeCellCoords.row] = [...newDataObj[activeCellCoords.row]];
              newDataObj[activeCellCoords.row][activeCellCoords.col] = val;
          }
          
          if (calcEditTimeout.current) clearTimeout(calcEditTimeout.current);
          calcEditTimeout.current = setTimeout(() => {
               setDocumentData(newDataObj);
          }, 300); // lightweight debouncing
      }
  };

  const handleInsertEquation = () => {
      if (module === 'writer' && documentData) {
         setDocumentData(documentData + `<br/> <div class="katex-render">\\(${eqText}\\)</div><br/>`);
      }
      setIsEqOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background absolute inset-0 z-50 overflow-hidden" ref={containerRef}>
      {/* App Bar (Title Bar) */}
      <header className="flex items-center justify-between h-14 px-2 border-b border-surface-variant font-sans shrink-0 bg-surface">
        <div className="flex items-center">
           <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors">
             <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <h2 className="text-lg font-medium tracking-[0.01em] ml-1 flex items-center gap-2 text-on-surface">
              Untitled Document
              <span className="text-xs uppercase bg-primary-container text-on-primary-container px-2 py-0.5 rounded-[8px] font-medium ml-2">
                 Phase 4
              </span>
           </h2>
        </div>
        <div className="flex items-center gap-1">
           <button onClick={() => setIsEqOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors" title="Insert Equation">
             <span className="material-symbols-outlined">functions</span>
           </button>
           <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors">
             <span className="material-symbols-outlined">search</span>
           </button>
           <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors">
             <span className="material-symbols-outlined">more_vert</span>
           </button>
        </div>
      </header>

      {/* Toolbar Layer */}
      {isRibbonOpen ? (
        <SimplifiedRibbon />
      ) : (
        <div className="w-full border-b border-surface-variant bg-surface shrink-0 flex items-center justify-between">
          <div className="flex overflow-x-auto no-scrollbar scroll-smooth px-2 py-1 items-center gap-1">
             {getToolbarItems().map((item, id) => {
               if (item.isSeparator) {
                 return <div key={`sep-${id}`} className="w-[1px] h-6 bg-outline/40 mx-1 shrink-0" />;
               }
               return (
                 <button 
                   key={item.id} 
                   onClick={() => {
                      if (item.id === 'bold') document.execCommand('bold');
                      else if (item.id === 'italic') document.execCommand('italic');
                      else if (item.id === 'underline') document.execCommand('underline');
                   }}
                   className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface-variant hover:text-primary shrink-0 text-on-surface-variant transition-colors"
                 >
                   <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                 </button>
               );
             })}
          </div>
          {/* Right side persistent toolbars for mobile */}
          <div className="flex items-center pr-2 pl-2 border-l border-outline/30 shrink-0 gap-1 bg-surface">
              <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface-variant text-on-surface-variant transition-colors" title="Show/hide keyboard">
                 <span className="material-symbols-outlined text-[20px]">keyboard</span>
              </button>
              <button onClick={() => setIsRibbonOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-primary-container text-on-surface-variant hover:text-primary transition-colors" title="Open simplified ribbon bar">
                 <span className="material-symbols-outlined text-[24px]">keyboard_arrow_down</span>
              </button>
          </div>
        </div>
      )}

      {/* Formula bar layer for Calc */}
      {module === 'calc' && documentData !== null && (
         <div className="w-full h-10 border-b border-surface-variant bg-surface flex items-center px-2 shadow-sm shrink-0 mt-1">
             <div className="flex items-center text-on-surface-variant px-2 border-r border-outline/30 mr-2 min-w-[40px] justify-center font-mono text-sm">
                fx
             </div>
             <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface font-sans h-full"
                placeholder="Formula or text (Select cell first)"
                value={activeCellCoords ? formulaValue : ""}
                onChange={handleFormulaChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur();
                        commitFormulaValue();
                    }
                }}
                disabled={!activeCellCoords}
             />
         </div>
      )}

      {/* FCT Mount point relative to container */}
      <FloatingContextualToolbar />

      {/* Editor Content Area (WASM target layer) */}
      <div className="flex-1 overflow-auto bg-surface-variant p-4 sm:p-4 flex flex-col items-center relative cursor-text select-none" onClick={handleDocumentClick}>
         <div className="w-full max-w-[816px] min-h-[max-content] bg-white shadow-md border border-outline/20 p-4 sm:p-12 pl-4 pr-4 rounded-sm relative mb-12">
            {documentData === null && (
              <>
                <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${getThemeColor()} font-sans pointer-events-none`}>LibreDroid {module?.charAt(0).toUpperCase() + (module?.slice(1) || '')}</h1>
                <p className="text-on-surface font-sans leading-relaxed pointer-events-none mb-4 text-sm sm:text-base">
                  This space will be managed by the WASM Bridge. Core editing functionality via LibreOffice engine will be compiled to WASM and render to an overlaying Canvas or DOM structure here.
                </p>
                
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
                    <h3 className="text-sm sm:text-base font-medium text-primary mb-2 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">touch_app</span>
                       Interactive FCT Demo
                    </h3>
                    {module === 'calc' ? (
                       <ul className="text-xs sm:text-sm text-on-surface-variant list-disc pl-5">
                           <li><b>Tap/Click once</b> anywhere here to trigger the Single Cell FCT.</li>
                           <li><b>Double Tap/Click</b> anywhere here to trigger the Multi-Range FCT.</li>
                           <li><b>Click table boundaries</b> from imported data to get Context Table FCT.</li>
                       </ul>
                    ) : (
                       <ul className="text-xs sm:text-sm text-on-surface-variant list-disc pl-5">
                           <li><b>Double Tap/Click</b> anywhere here to select text and trigger the standard Writer/Impress FCT.</li>
                           <li><b>Click table boundaries</b> from imported data to get Context Table FCT.</li>
                       </ul>
                    )}
                </div>

                <div className="my-8 h-[1px] bg-surface-variant w-full pointer-events-none" />
                <p className="text-on-surface font-sans leading-relaxed text-xs sm:text-sm text-outline pointer-events-none">
                  Phase 4 Mobile-first UI preview with Material 3 Expressive. Open the Simplified Ribbon using the top right downward arrow.
                </p>
              </>
            )}

            {module === 'writer' && documentData !== null && ( // Uncontrolled component
              <div 
                ref={writerRef}
                className="prose prose-sm sm:prose-base max-w-none font-sans text-on-surface outline-none"
                contentEditable
                suppressContentEditableWarning
                onInput={handleWriterInput}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
              />
            )}

            {module === 'calc' && documentData !== null && currentSheetData && Array.isArray(currentSheetData) && (
              <div className="w-full overflow-x-auto no-scrollbar pb-6 relative">
                 <CalcTableRender 
                    sheetData={currentSheetData}
                    activeCellCoords={activeCellCoords}
                    formulaValue={formulaValue}
                    onCellSelect={handleCellSelect}
                 />
              </div>
            )}

            {documentData !== null && module === 'impress' && (
               <div className="flex flex-col h-full w-full">
                  <div className="flex-1 flex items-center justify-center bg-surface-variant/50 border border-outline/20 rounded-lg mb-6 min-h-[300px] mt-2 shadow-inner">
                     <span className="material-symbols-outlined text-6xl opacity-20">slideshow</span>
                     <p className="text-on-surface-variant ml-4 font-medium opacity-50 text-sm">Slide 1 Preview</p>
                  </div>
                  {/* Slide Sorter */}
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-outline mb-2">Slide Sorter</h4>
                  <div className="h-24 w-full bg-surface border border-outline/20 rounded-lg flex items-center gap-3 px-3 overflow-x-auto no-scrollbar shadow-sm">
                     {[1, 2, 3, 4, 5, 6].map(slide => (
                       <div key={slide} className={`min-w-[120px] h-16 rounded border transition-colors ${slide === 1 ? 'border-primary bg-primary/10' : 'border-outline/30 bg-white hover:bg-surface-variant'} flex items-center justify-center cursor-pointer shrink-0`}>
                         <span className={`text-xs font-medium ${slide === 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Slide {slide}</span>
                       </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* Calc Sheet Tabs Layer */}
      {module === 'calc' && isMultiSheet && (
         <div className="w-full h-10 border-t border-outline/30 bg-surface flex items-center shrink-0 overflow-x-auto no-scrollbar shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
            {documentData.map((sheet: any, i: number) => (
                <div 
                    key={i} 
                    onClick={() => { setActiveSheetIdx(i); setActiveCellCoords(null); setFormulaValue(""); }}
                    className={`px-6 h-full flex items-center justify-center text-sm cursor-pointer border-r border-outline/20 font-medium transition-colors ${activeSheetIdx === i ? 'bg-white text-primary border-t-[3px] border-t-primary pt-[1px]' : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
                >
                   {sheet.name || `Sheet ${i + 1}`}
                </div>
            ))}
         </div>
      )}

      {/* Equation Editor Dialog */}
      <AnimatePresence>
         {isEqOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setIsEqOpen(false)}
            >
               <motion.div
                 initial={{ scale: 0.95, y: 10 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.95, y: 10 }}
                 onClick={e => e.stopPropagation()}
                 className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col border border-outline/20"
               >
                 <div className="flex items-center justify-between p-4 border-b border-outline/20 bg-surface-variant/30">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">functions</span>
                       Insert Equation
                    </h3>
                    <button onClick={() => setIsEqOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
                       <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                 </div>
                 
                 <div className="flex flex-col p-6 gap-6">
                    <div className="flex flex-col gap-2">
                       <label className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">LaTeX Input</label>
                       <textarea 
                          value={eqText}
                          onChange={(e) => setEqText(e.target.value)}
                          className="w-full bg-surface-variant/50 border border-outline/30 rounded-lg p-3 text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-24 text-on-surface"
                          placeholder="\sum_{i=1}^n x_i"
                       />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">Preview Result (KaTeX)</label>
                       <div 
                         className="w-full min-h-[100px] border border-outline/20 rounded-lg bg-white p-4 flex items-center justify-center overflow-x-auto shadow-inner text-on-surface"
                         ref={eqPreviewRef}
                       ></div>
                    </div>
                 </div>

                 <div className="p-4 border-t border-outline/20 bg-surface-variant/20 flex justify-end gap-3">
                    <button onClick={() => setIsEqOpen(false)} className="px-5 py-2 rounded-full font-medium text-sm hover:bg-surface-variant transition-colors text-on-surface-variant">Cancel</button>
                    <button onClick={handleInsertEquation} className="px-5 py-2 rounded-full font-medium text-sm bg-primary text-on-primary hover:bg-primary/90 shadow-sm transition-colors flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">add_circle</span>
                       Insert
                    </button>
                 </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}

export function EditorView(props: EditorViewProps) {
  return <EditorLayout onBack={props.onBack} />;
}
