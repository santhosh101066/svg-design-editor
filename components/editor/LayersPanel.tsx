import React, { useState, useMemo } from 'react';
import { useDesignState } from '../../context/DesignContext';
import { TrashIcon, ChevronDownIcon } from '../icons';
import { ToolIcons } from '../../constants';
import { DesignElement, TextElement } from '../../types';

const LayersPanel: React.FC = () => {
    const { 
        layers, addLayer, deleteLayer, renameLayer, toggleLayerVisibility,
        designData, moveObject, selectedObjId, setSelectedObjId, activeLayerId, setActiveLayerId 
    } = useDesignState();
    
    const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null);
    const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        if (layers.length > 0) {
            initialState[layers[0].id] = true;
        }
        return initialState;
    });
    const [dropTarget, setDropTarget] = useState<{ layerId: string; objectId: string | null } | null>(null);

    const objectsByLayer = useMemo(() => {
        const grouped: Record<string, DesignElement[]> = {};
        for (const layer of layers) {
            grouped[layer.id] = [];
        }
        Object.values(designData).forEach(obj => {
            if (obj.layerId && grouped[obj.layerId]) {
                grouped[obj.layerId].push(obj);
            }
        });
        for (const layerId in grouped) {
            grouped[layerId].sort((a, b) => b.zIndex - a.zIndex);
        }
        return grouped;
    }, [designData, layers]);

    const handleRename = (id: string, newName: string) => {
        if (newName.trim()) {
            renameLayer(id, newName.trim());
        }
        setRenamingLayerId(null);
    };

    const toggleLayerExpansion = (layerId: string) => {
        setExpandedLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
    };

    const handleObjectDragStart = (e: React.DragEvent, objectId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', objectId);
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent, targetLayerId: string, targetObjectId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedObjectId = e.dataTransfer.getData('text/plain');
        if (draggedObjectId && draggedObjectId !== targetObjectId) {
            moveObject(draggedObjectId, targetLayerId, targetObjectId);
        }
        setDropTarget(null);
    };
    
    const getObjectDisplayName = (obj: DesignElement) => {
        if (obj.type === 'text') {
            const textContent = (obj as TextElement).rawText;
            return textContent.substring(0, 20) + (textContent.length > 20 ? '...' : '');
        }
        return obj.id;
    }

    return (
        <div className="flex flex-col h-full text-sm">
            <div className="flex-1 overflow-y-auto">
                {layers.map((layer) => (
                    <div key={layer.id} className="border-b border-gray-200">
                        <div
                            onClick={() => setActiveLayerId(layer.id)}
                            onDragOver={(e) => { e.preventDefault(); setDropTarget({ layerId: layer.id, objectId: null }); }}
                            onDragLeave={() => setDropTarget(null)}
                            onDrop={(e) => handleDrop(e, layer.id, null)}
                            className={`flex items-center p-2 cursor-pointer transition-colors ${activeLayerId === layer.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                        >
                            <button onClick={(e) => { e.stopPropagation(); toggleLayerExpansion(layer.id); }} className="mr-2 p-1 text-gray-500 hover:text-gray-800">
                                <ChevronDownIcon />
                            </button>
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
                                    <span>{layer.name}</span>
                                )}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="ml-2 p-1 text-gray-400 hover:text-red-500" disabled={layers.length <= 1}>
                                <TrashIcon />
                            </button>
                        </div>

                        {expandedLayers[layer.id] && (
                            <div className="pl-6 bg-gray-50">
                                {dropTarget?.layerId === layer.id && dropTarget.objectId === null && (
                                    <div className="h-1 bg-blue-400"></div>
                                )}
                                {objectsByLayer[layer.id]?.map(obj => (
                                    <div key={obj.id}>
                                        <div
                                            draggable
                                            onClick={() => { setSelectedObjId(obj.id); setActiveLayerId(layer.id); }}
                                            onDragStart={(e) => handleObjectDragStart(e, obj.id)}
                                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropTarget({ layerId: layer.id, objectId: obj.id }); }}
                                            onDragLeave={() => setDropTarget(null)}
                                            onDrop={(e) => handleDrop(e, layer.id, obj.id)}
                                            onDragEnd={() => setDropTarget(null)}
                                            className={`flex items-center p-2 pl-4 border-t border-gray-200 cursor-grab ${selectedObjId === obj.id ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                                        >
                                            <span className="mr-2 text-gray-500">{ToolIcons[obj.type]}</span>
                                            <span className="truncate">{getObjectDisplayName(obj)}</span>
                                        </div>
                                        {dropTarget?.layerId === layer.id && dropTarget.objectId === obj.id && (
                                            <div className="h-1 bg-blue-400"></div>
                                        )}
                                    </div>
                                ))}
                                {objectsByLayer[layer.id]?.length === 0 && <p className="p-2 text-xs text-gray-500">This layer is empty.</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-gray-200">
                <button
                    onClick={addLayer}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
                >
                    + Add Layer
                </button>
            </div>
        </div>
    );
};

export default LayersPanel;
