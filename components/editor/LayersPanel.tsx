import React, { useState } from 'react';
import { useDesignState } from '../../context/DesignContext';
import { TrashIcon } from '../icons';

const LayersPanel: React.FC = () => {
    const { layers, setLayers, activeLayerId, setActiveLayerId, addLayer, deleteLayer, renameLayer, toggleLayerVisibility } = useDesignState();
    const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleRename = (id: string, newName: string) => {
        if(newName.trim()) {
            renameLayer(id, newName.trim());
        }
        setRenamingLayerId(null);
    }

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const reorderedLayers = [...layers];
        const [draggedItem] = reorderedLayers.splice(draggedIndex, 1);
        reorderedLayers.splice(index, 0, draggedItem);
        
        setLayers(reorderedLayers);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };


    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {layers.map((layer, index) => (
                    <div
                        key={layer.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`flex items-center p-2 border-b border-gray-200 cursor-pointer transition-colors ${activeLayerId === layer.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                    >
                        <button onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }} className="mr-2 p-1 text-gray-500 hover:text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {layer.visible ? <>
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                                </> : <path d="M9.9 9.9 4.2 4.2C2.1 6.3 1 9 1 12c2.2-4 5.8-7 11-7 1.6 0 3 .5 4.4 1.2l-2.5 2.5" />}
                            </svg>
                        </button>
                        <div className="flex-1" onDoubleClick={() => setRenamingLayerId(layer.id)}>
                            {renamingLayerId === layer.id ? (
                                <input
                                    type="text"
                                    defaultValue={layer.name}
                                    onBlur={(e) => handleRename(layer.id, e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(layer.id, e.currentTarget.value) }}
                                    className="w-full p-1 border rounded"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-sm">{layer.name}</span>
                            )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="ml-2 p-1 text-gray-400 hover:text-red-500" disabled={layers.length <= 1}>
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-gray-200">
                <button
                    onClick={addLayer}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm"
                >
                    + Add Layer
                </button>
            </div>
        </div>
    );
};

export default LayersPanel;
