

import { useEffect } from 'react';
import { DesignData, ToolType, Point } from '../types';

interface UseShortcutsProps {
  deleteObject: (id: string) => void;
  selectedObjId: string | null;
  setSelectedObjId: (id: string | null) => void;
  setCurrentTool: (tool: ToolType) => void;
  undo: () => void;
  redo: () => void;
  imageEditModeId: string | null;
  setImageEditModeId: (id: string | null) => void;
  editingTextId: string | null;
  setEditingTextId: (id: string | null) => void;
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  setCurrentPath: (path: string) => void;
  setCurrentPolygonPoints: (points: any) => void;
  onDrawingFinish: () => void;
  currentPolygonPoints: Point[];
}

export const useShortcuts = ({ 
  deleteObject, selectedObjId, setSelectedObjId, setCurrentTool, undo, redo, 
  imageEditModeId, setImageEditModeId, editingTextId, setEditingTextId, 
  isDrawing, setIsDrawing, setCurrentPath, setCurrentPolygonPoints,
  onDrawingFinish, currentPolygonPoints
}: UseShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.id !== 'text-editor-overlay') {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjId) {
        e.preventDefault();
        deleteObject(selectedObjId);
      } else if (e.key === 'Escape') {
        if (isDrawing) {
          if (currentPolygonPoints.length > 2) {
            onDrawingFinish();
          } else {
            setIsDrawing(false);
            setCurrentPath('');
            setCurrentPolygonPoints([]);
            setCurrentTool(ToolType.Select);
          }
        } else if (editingTextId) {
          setEditingTextId(null);
        } else if (imageEditModeId) {
          setImageEditModeId(null);
        } else if (selectedObjId) {
          setSelectedObjId(null);
        } else {
          setCurrentTool(ToolType.Select);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedObjId, setSelectedObjId, setCurrentTool, deleteObject, undo, redo, 
    imageEditModeId, setImageEditModeId, editingTextId, setEditingTextId,
    isDrawing, setIsDrawing, setCurrentPath, setCurrentPolygonPoints,
    onDrawingFinish, currentPolygonPoints
  ]);
};
