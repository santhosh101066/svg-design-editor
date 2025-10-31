import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { DesignData, Layout, SavedDesign, Layer } from '../types';

interface UseSaveProps {
  designData: DesignData;
  layout: Layout;
  layers: Layer[];
}

export const useSave = ({ designData, layout, layers }: UseSaveProps) => {
  const [layoutDesigns, setLayoutDesigns] = useState<SavedDesign[]>([]);
  const [designs, setDesigns] = useState<SavedDesign[]>([]);

  useEffect(() => {
    try {
      const savedLayouts = localStorage.getItem('layouts');
      const savedDesigns = localStorage.getItem('designs');
      setLayoutDesigns(savedLayouts ? JSON.parse(savedLayouts) : []);
      setDesigns(savedDesigns ? JSON.parse(savedDesigns) : []);
    } catch (error) {
      console.error('Failed to parse from localStorage:', error);
    }
  }, []);

  const saveData = (key: 'layouts' | 'designs', state: SavedDesign[], setState: Dispatch<SetStateAction<SavedDesign[]>>) => {
    const newSave: SavedDesign = { designData, layout, layers };
    const updatedData = [...state, newSave];
    setState(updatedData);
    localStorage.setItem(key, JSON.stringify(updatedData));
  };

  const deleteData = (key: 'layouts' | 'designs', index: number, state: SavedDesign[], setState: Dispatch<SetStateAction<SavedDesign[]>>) => {
    const updatedData = state.filter((_, i) => i !== index);
    setState(updatedData);
    localStorage.setItem(key, JSON.stringify(updatedData));
  };

  return {
    layoutDesigns,
    designs,
    onLayoutSave: () => saveData('layouts', layoutDesigns, setLayoutDesigns),
    onDesignSave: () => saveData('designs', designs, setDesigns),
    onLayoutDelete: (index: number) => deleteData('layouts', index, layoutDesigns, setLayoutDesigns),
    onDesignDelete: (index: number) => deleteData('designs', index, designs, setDesigns),
  };
};
