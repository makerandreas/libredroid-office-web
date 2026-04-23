import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SelectionType = 'none' | 'text' | 'calc_single_cell' | 'calc_multi_range' | 'object' | 'table';

export type ModuleType = 'writer' | 'calc' | 'impress';

interface EditorContextType {
  module: ModuleType | null;
  setModule: (module: ModuleType | null) => void;
  selectionType: SelectionType;
  setSelectionType: (type: SelectionType) => void;
  isRibbonOpen: boolean;
  setIsRibbonOpen: (open: boolean) => void;
  fctPosition: { x: number; y: number } | null;
  setFctPosition: (pos: { x: number; y: number } | null) => void;
  documentData: any | null;
  setDocumentData: (data: any) => void;
  isParsing: boolean;
  setIsParsing: (parsing: boolean) => void;
  isEqOpen: boolean;
  setIsEqOpen: (open: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [module, setModule] = useState<ModuleType | null>(null);
  const [selectionType, setSelectionType] = useState<SelectionType>('none');
  const [isRibbonOpen, setIsRibbonOpen] = useState(false);
  const [fctPosition, setFctPosition] = useState<{ x: number; y: number } | null>(null);
  const [documentData, setDocumentData] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);

  return (
    <EditorContext.Provider value={{
      module,
      setModule,
      selectionType,
      setSelectionType,
      isRibbonOpen,
      setIsRibbonOpen,
      fctPosition,
      setFctPosition,
      documentData,
      setDocumentData,
      isParsing,
      setIsParsing,
      isEqOpen,
      setIsEqOpen
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorState() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorState must be used within an EditorProvider');
  }
  return context;
}

