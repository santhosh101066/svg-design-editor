
import React, { useState, useRef, useEffect, useCallback, createContext, useContext, useLayoutEffect } from 'react';
import { DesignData, Layout, Point, SelectionBox, Permission, ToolType, ResizeHandle, DesignElement, TextElement, RectElement, ImageElement, Layer, PathElement, PolygonElement, Anchor, SavedDesign } from '../types';
import { useSave } from '../hooks/useSave';
import { useShortcuts } from '../hooks/useShortcuts';
import { getNextShapeId, getPointsFromPath, updatePathWithNewPoints, getMaxZIndex } from '../utils/shapes';
import { createTextBoxes } from '../utils/text';
import { PADDING, MIN_OBJ_SIZE } from '../constants';

interface DesignContextState {
  designData: DesignData;
  setDesignData: React.Dispatch<React.SetStateAction<DesignData>>;
  updateDesignDataWithHistory: (newState: DesignData | ((prevState: DesignData) => DesignData)) => void;
  layout: Layout;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  currentTool: ToolType;
  setCurrentTool: React.Dispatch<React.SetStateAction<ToolType>>;
  selectedObjId: string | null;
  setSelectedObjId: React.Dispatch<React.SetStateAction<string | null>>;
  imageEditModeId: string | null;
  setImageEditModeId: React.Dispatch<React.SetStateAction<string | null>>;
  editingTextId: string | null;
  setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>;
  svgRef: React.RefObject<SVGSVGElement>;
  previewRef: React.RefObject<SVGSVGElement>;
  playgroundRef: React.RefObject<HTMLDivElement>;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onControlPointDown: (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => void;
  onObjMouseDown: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  onImageMouseDown: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  onObjDblClick: (id: string) => void;
  onDrawingFinish: () => void; // For Polygon tool
  fileInputRef: React.RefObject<HTMLInputElement>;
  updateImageFrame: (imageUrl: string, objId: string, dimensions: { imgWidth: number; imgHeight: number }) => void;
  requestImageUpload: () => void;
  requestThemeImageUpload: (slot: 'primary' | 'secondary') => void;
  updateThemeImage: (slot: 'primary' | 'secondary', imageUrl: string) => void;
  applyThemeImage: (imageElementId: string, themeSlot: 'primary' | 'secondary' | null) => void;
  bringToFront: () => void;
  sendToBack: () => void;
  cursorPosition: Point;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  permissions: Permission;
  setPermissions: React.Dispatch<React.SetStateAction<Permission>>;
  canEditObject: (objId: string | null) => boolean;
  selection: SelectionBox;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: (padding?: number) => void;
  panOffset: Point;
  setPanOffset: React.Dispatch<React.SetStateAction<Point>>;
  isPanning: boolean;
  layoutDesigns: any[];
  designs: any[];
  onLayoutSave: () => void;
  onDesignSave: () => void;
  onLayoutDelete: (index: number) => void;
  onDesignDelete: (index: number) => void;
  // Layers
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  activeLayerId: string | null;
  setActiveLayerId: React.Dispatch<React.SetStateAction<string | null>>;
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  toggleLayerVisibility: (id: string) => void;
  deleteObject: (id: string) => void;
  moveObject: (draggedObjectId: string, targetLayerId: string, targetObjectId: string | null) => void;
  // Drawing state
  currentPath: string;
  currentPolygonPoints: Point[];
  // Dragging/Editing state
  onAnchorMouseDown: (e: React.MouseEvent, elementId: string, pointIndex: number) => void;
  loadDesign: (design: SavedDesign) => void;
}

const DesignContext = createContext<DesignContextState | null>(null);

export function useDesignState(): DesignContextState {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesignState must be used within a DesignProvider');
  }
  return context;
}

export const DesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [designData, setDesignData] = useState<DesignData>({});
  const [history, setHistory] = useState<{ past: DesignData[], future: DesignData[] }>({ past: [], future: [] });
  const [layout, setLayout] = useState<Layout>({
    height: 600, width: 800,
    themeColors: { primary: '#3b82f6', secondary: '#64748b', tertiary: '#ecfdf5' },
    themeImages: { primary: null, secondary: null }
  });
  const [layers, setLayers] = useState<Layer[]>([{ id: `layer-${Date.now()}`, name: 'Layer 1', visible: true }]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(layers[0].id);
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.Select);
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
  const [imageEditModeId, setImageEditModeId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionBox>({ select: false, x: 0, y: 0, height: 0, width: 0, startX: 0, startY: 0 });
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [permissions, setPermissions] = useState<Permission>(Permission.FULL);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 });
  const [dragObjectStartPos, setDragObjectStartPos] = useState<DesignElement | null>(null);
  const [dragMouseStartPos, setDragMouseStartPos] = useState<Point | null>(null);

  const [currentPath, setCurrentPath] = useState('');
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<Point[]>([]);
  
  const [draggedAnchor, setDraggedAnchor] = useState<Anchor | null>(null);
  const historyInitialState = useRef<DesignData | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const previewRef = useRef<SVGSVGElement>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pinchStateRef = useRef({
      isPinching: false,
      initialDist: 0,
      initialZoom: 1,
  }).current;

  const { onDesignSave, onLayoutSave, onLayoutDelete, onDesignDelete, layoutDesigns, designs } = useSave({ designData, layout, layers });

  const updateDesignDataWithHistory = useCallback((newState: DesignData | ((prevState: DesignData) => DesignData)) => {
    setHistory(prev => ({
      past: [...prev.past, designData],
      future: [],
    }));
    setDesignData(newState);
  }, [designData]);

  useEffect(() => {
    if (!layout.themeColors) return;
    setDesignData(prev => {
        const newData = { ...prev };
        let changed = false;
        for (const id in newData) {
            const element = newData[id];
            if (element.fillThemeColor && layout.themeColors) {
                const newFill = layout.themeColors[element.fillThemeColor];
                if (element.fill !== newFill) {
                    newData[id] = { ...element, fill: newFill };
                    changed = true;
                }
            }
            if (element.strokeThemeColor && layout.themeColors) {
                const newStroke = layout.themeColors[element.strokeThemeColor];
                if (element.stroke !== newStroke) {
                    newData[id] = { ...element, stroke: newStroke };
                    changed = true;
                }
            }
        }
        return changed ? newData : prev;
    });
  }, [layout.themeColors]);

  useEffect(() => {
    if (!layout.themeImages) return;

    const imageElements = Object.values(designData).filter(
      (el): el is ImageElement => el.type === ToolType.Image && !!el.themeImage
    );

    if (imageElements.length === 0) return;

    const imagePromises = imageElements.map((imageElement) => {
      const imageUrl = layout.themeImages![imageElement.themeImage!];
      if (!imageUrl) return Promise.resolve(null);

      return new Promise<[string, Partial<ImageElement>] | null>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const frameObj = designData[imageElement.linkedObj!] as RectElement;
          if (!frameObj) return resolve(null);

          const dimensions = { imgWidth: img.width, imgHeight: img.height };
          const frameAspect = frameObj.width / frameObj.height;
          const imgAspect = dimensions.imgWidth / dimensions.imgHeight;

          let newWidth, newHeight, newX, newY;
          if (frameAspect > imgAspect) {
            newWidth = frameObj.width;
            newHeight = frameObj.width / imgAspect;
            newX = frameObj.x;
            newY = frameObj.y + (frameObj.height - newHeight) / 2;
          } else {
            newHeight = frameObj.height;
            newWidth = frameObj.height * imgAspect;
            newY = frameObj.y;
            newX = frameObj.x + (frameObj.width - newWidth) / 2;
          }

          resolve([
            imageElement.id,
            {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
              imgWidth: dimensions.imgWidth,
              imgHeight: dimensions.imgHeight,
            },
          ]);
        };
        img.onerror = () => resolve(null);
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
      });
    });

    Promise.all(imagePromises).then((updates) => {
      const validUpdates = updates.filter((u): u is [string, Partial<ImageElement>] => u !== null);
      if (validUpdates.length > 0) {
        setDesignData((prev) => {
          const newData = { ...prev };
          let hasChanged = false;
          for (const [id, props] of validUpdates) {
            const currentElement = newData[id] as ImageElement;
            if (
              currentElement.x !== props.x ||
              currentElement.y !== props.y ||
              currentElement.width !== props.width ||
              currentElement.height !== props.height
            ) {
              newData[id] = { ...currentElement, ...props };
              hasChanged = true;
            }
          }
          return hasChanged ? newData : prev;
        });
      }
    });
  }, [layout.themeImages, designData, setDesignData]);


  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    const previousState = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    setHistory({ past: newPast, future: [designData, ...history.future] });
    setDesignData(previousState);
    setSelectedObjId(null);
  }, [history, designData]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    const nextState = history.future[0];
    const newFuture = history.future.slice(1);
    setHistory({ past: [...history.past, designData], future: newFuture });
    setDesignData(nextState);
    setSelectedObjId(null);
  }, [history, designData]);
  
  const deleteObject = useCallback((id: string) => {
    updateDesignDataWithHistory(prev => {
        const newData = { ...prev };
        const obj = newData[id];
        if (!obj) return prev;
        if (obj.linkedObj) delete newData[obj.linkedObj];
        delete newData[id];
        return newData;
    });
    setSelectedObjId(null);
  }, [updateDesignDataWithHistory]);
  
  const onDrawingFinish = useCallback(() => {
    if (currentTool === ToolType.Polygon && currentPolygonPoints.length > 2) {
      const newElementId = getNextShapeId(designData, currentTool);
      const zIndex = getMaxZIndex(designData) + 1;
      const minX = Math.min(...currentPolygonPoints.map(p => p.x));
      const minY = Math.min(...currentPolygonPoints.map(p => p.y));
      const newPolygon: PolygonElement = {
        id: newElementId,
        type: ToolType.Polygon,
        points: currentPolygonPoints.map(p => ({ x: p.x - minX, y: p.y - minY })),
        x: minX,
        y: minY,
        width: Math.max(...currentPolygonPoints.map(p => p.x)) - minX,
        height: Math.max(...currentPolygonPoints.map(p => p.y)) - minY,
        fill: '#cccccc',
        stroke: 'black',
        strokeWidth: 1,
        zIndex,
        strokeOpacity: 1,
        fillOpacity: 1,
        edit: true,
        seal: false,
        linkedObj: null,
        layerId: activeLayerId!,
      };
      updateDesignDataWithHistory(prev => ({ ...prev, [newElementId]: newPolygon }));
      setCurrentPolygonPoints([]);
      setIsDrawing(false);
      setCurrentTool(ToolType.Select);
    } else {
        setCurrentPolygonPoints([]);
        setIsDrawing(false);
    }
  }, [currentTool, currentPolygonPoints, designData, updateDesignDataWithHistory, activeLayerId]);

  useShortcuts({ 
    deleteObject, selectedObjId, setSelectedObjId, setCurrentTool, undo, redo, 
    imageEditModeId, setImageEditModeId, editingTextId, setEditingTextId, 
    isDrawing, setIsDrawing, setCurrentPath, setCurrentPolygonPoints,
    onDrawingFinish, currentPolygonPoints
  });
  
  const getEventPoint = (e: React.MouseEvent<any> | React.TouchEvent<any>, index = 0): { clientX: number, clientY: number } => {
    if ('touches' in e) {
        return e.touches[index];
    }
    return e;
  }

  const getMousePosition = useCallback((e: React.MouseEvent<any> | React.TouchEvent<any>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    const eventPoint = getEventPoint(e);
    if(!eventPoint) return {x: 0, y: 0};
    point.x = eventPoint.clientX;
    point.y = eventPoint.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const invertedCtm = ctm.inverse();
      const svgPoint = point.matrixTransform(invertedCtm);
      const worldX = (svgPoint.x - (PADDING + panOffset.x)) / zoom;
      const worldY = (svgPoint.y - (PADDING + panOffset.y)) / zoom;
      return { x: worldX, y: worldY };
    }
    return { x: 0, y: 0 };
  }, [panOffset, zoom]);

  const canEditObject = useCallback((objId: string | null): boolean => {
    if (permissions === Permission.FULL) return true;
    if (!objId) return false;
    if (permissions === Permission.READONLY) return false;

    if (permissions === Permission.PARTIAL) {
        const obj = designData[objId];
        if (!obj?.edit) return false; 

        if (obj.type === ToolType.Rect && ((obj as RectElement).textbox || (obj as RectElement).photobox)) {
            return true;
        }
        if (obj.type === ToolType.Text || obj.type === ToolType.Image) {
            return true;
        }
        return false;
    }
    return false;
  }, [permissions, designData]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ('touches' in e && e.touches.length > 1) {
        if (e.touches.length === 2) {
            pinchStateRef.isPinching = true;
            pinchStateRef.initialDist = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
            pinchStateRef.initialZoom = zoom;
        }
        return;
    }
    
    if (imageEditModeId && !((e.target as HTMLElement).closest('svg g > image'))) {
        setImageEditModeId(null);
    }
    
    const mousePos = getMousePosition(e);
    const eventPoint = getEventPoint(e);
    const isMiddleClick = 'button' in e && e.button === 1;

    if (currentTool === ToolType.Pan || isMiddleClick) {
      setIsPanning(true);
      setPanStart({ x: eventPoint.clientX - panOffset.x, y: eventPoint.clientY - panOffset.y });
      e.preventDefault();
      return;
    }

    if (currentTool === ToolType.Text) {
      if (permissions !== Permission.FULL) return;
      updateDesignDataWithHistory(prev => {
        const maxZIndex = getMaxZIndex(prev);
        const textZIndex = maxZIndex + 1;
        const boxZIndex = maxZIndex + 2;
        const textId = getNextShapeId(prev, ToolType.Text);
        const boxId = getNextShapeId(prev, ToolType.Rect);

        const newBox: RectElement = {
            id: boxId, type: ToolType.Rect, textbox: true,
            x: mousePos.x, y: mousePos.y, width: 150, height: 50,
            zIndex: boxZIndex, linkedObj: textId, fill: null, stroke: '#cccccc', strokeWidth: 1,
            edit: true, seal: false, strokeOpacity: 1, fillOpacity: 1, autoHeight: true,
            borderRadius: 0, layerId: activeLayerId!,
        };

        const newText: TextElement = {
            id: textId, type: ToolType.Text, rawText: 'New Text', text: [],
            x: mousePos.x, y: mousePos.y, width: 150, height: 50,
            fontSize: 24, fontFamily: 'Arial', fill: '#000000', stroke: 'none', strokeWidth: 0,
            zIndex: textZIndex, edit: true, seal: false, linkedObj: boxId, layerId: activeLayerId!,
            strokeOpacity: 1, fillOpacity: 1,
        };
        
        const tempDesignData = { ...prev, [textId]: newText, [boxId]: newBox };
        const { spans, requiredHeight } = createTextBoxes(newText, tempDesignData);
        newText.text = spans;
        newBox.height = requiredHeight;

        setSelectedObjId(boxId);
        setEditingTextId(textId);
        setCurrentTool(ToolType.Select);
        
        return { ...prev, [textId]: newText, [boxId]: newBox };
      });
      return;
    }

    if (currentTool !== ToolType.Polygon || (currentTool === ToolType.Polygon && currentPolygonPoints.length === 0)) {
        setSelectedObjId(null);
    }
    if (permissions !== Permission.FULL && currentTool !== ToolType.Select) return;
    
    setIsDrawing(true);

    if (currentTool === ToolType.Select) {
      setSelection({ select: true, startX: mousePos.x, startY: mousePos.y, x: mousePos.x, y: mousePos.y, width: 0, height: 0 });
    } else if (currentTool === ToolType.Pen) {
        setCurrentPath(`M ${mousePos.x} ${mousePos.y}`);
    } else if (currentTool === ToolType.Polygon) {
        setCurrentPolygonPoints(prev => [...prev, mousePos]);
    } else { // Rect, Ellipse, Image
      historyInitialState.current = designData;
      const baseElementProps = {
          x: mousePos.x, y: mousePos.y, width: 0, height: 0,
          edit: true, seal: false, layerId: activeLayerId!,
          strokeOpacity: 1, fillOpacity: 1, linkedObj: null,
      };

      if (currentTool === ToolType.Image) {
          const maxZIndex = getMaxZIndex(designData);
          const imageZIndex = maxZIndex + 1;
          const boxZIndex = maxZIndex + 2;
          const imageId = getNextShapeId(designData, ToolType.Image);
          const boxId = getNextShapeId({ ...designData, [imageId]: {} as any }, ToolType.Rect);
          const newImage: ImageElement = { ...baseElementProps, id: imageId, type: ToolType.Image, linkedObj: boxId, fill: null, stroke: 'none', strokeWidth: 0, zIndex: imageZIndex };
          const newBox: RectElement = { ...baseElementProps, id: boxId, type: ToolType.Rect, photobox: true, zIndex: boxZIndex, linkedObj: imageId, fill: '#e5e7eb', stroke: 'black', strokeWidth: 1, borderRadius: 0 };
          setDesignData(prev => ({ ...prev, [imageId]: newImage, [boxId]: newBox }));
          setSelectedObjId(boxId);
          setDragObjectStartPos(newBox);
      } else {
          const zIndex = getMaxZIndex(designData) + 1;
          const newElementId = getNextShapeId(designData, currentTool);
          const newElement: DesignElement = { ...baseElementProps, id: newElementId, type: currentTool, fill: '#cccccc', stroke: 'black', strokeWidth: 1, zIndex } as DesignElement;
          if (newElement.type === ToolType.Rect) (newElement as RectElement).borderRadius = 0;
          setDesignData(prev => ({ ...prev, [newElementId]: newElement }));
          setSelectedObjId(newElementId);
          setDragObjectStartPos(newElement);
      }
      
      setIsResizing(true);
      setResizeHandle('SE');
      setDragMouseStartPos(mousePos);
    }
  }, [imageEditModeId, getMousePosition, currentTool, permissions, currentPolygonPoints.length, panOffset.x, panOffset.y, designData, activeLayerId, updateDesignDataWithHistory, pinchStateRef, zoom]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ('touches' in e && e.touches.length === 2 && pinchStateRef.isPinching) {
        const newDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY
        );

        const scale = newDist / pinchStateRef.initialDist;
        let newZoom = pinchStateRef.initialZoom * scale;
        newZoom = Math.max(0.1, Math.min(newZoom, 20));

        const svg = svgRef.current;
        if (svg) {
            const midPointClient = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2
            };
            const point = svg.createSVGPoint();
            point.x = midPointClient.x;
            point.y = midPointClient.y;
            const ctm = svg.getScreenCTM()?.inverse();
            if(ctm) {
                const svgPoint = point.matrixTransform(ctm);
                const worldX = (svgPoint.x - (PADDING + panOffset.x)) / zoom;
                const worldY = (svgPoint.y - (PADDING + panOffset.y)) / zoom;

                const newPanX = svgPoint.x - worldX * newZoom - PADDING;
                const newPanY = svgPoint.y - worldY * newZoom - PADDING;

                setZoom(newZoom);
                setPanOffset({ x: newPanX, y: newPanY });
            }
        }
        return;
    }

    if (pinchStateRef.isPinching) return;

    const mousePos = getMousePosition(e);
    setCursorPosition(mousePos);
    const eventPoint = getEventPoint(e);

    if (isPanning) {
      setPanOffset({ x: eventPoint.clientX - panStart.x, y: eventPoint.clientY - panStart.y });
      return;
    }
    
    const activeId = imageEditModeId || selectedObjId;

    if (isResizing && activeId && resizeHandle && dragObjectStartPos && dragMouseStartPos) {
        const { x: originalX, y: originalY, width: originalWidth, height: originalHeight } = dragObjectStartPos;
        const dx = mousePos.x - dragMouseStartPos.x;
        const dy = mousePos.y - dragMouseStartPos.y;
        const isImage = !!imageEditModeId;
        const isShiftPressed = 'shiftKey' in e && e.shiftKey;
        
        let x = originalX;
        let y = originalY;
        let width = originalWidth;
        let height = originalHeight;

        if (resizeHandle.includes('W')) { width -= dx; }
        if (resizeHandle.includes('N')) { height -= dy; }
        if (resizeHandle.includes('E')) { width += dx; }
        if (resizeHandle.includes('S')) { height += dy; }

        if ((isShiftPressed || isImage) && originalWidth > 0 && originalHeight > 0) {
            const aspectRatio = originalWidth / originalHeight;
            let isWidthDriven = false;
            
            if (resizeHandle.includes('W') || resizeHandle.includes('E')) {
                isWidthDriven = true;
            } else if (resizeHandle.includes('N') || resizeHandle.includes('S')) {
                isWidthDriven = false;
            } else {
                const widthChange = Math.abs(width - originalWidth);
                const heightChange = Math.abs(height - originalHeight);
                isWidthDriven = widthChange > heightChange * aspectRatio;
            }

            if (isWidthDriven) {
                height = width / aspectRatio;
            } else {
                width = height * aspectRatio;
            }
        }

        if (width < MIN_OBJ_SIZE) {
            width = MIN_OBJ_SIZE;
            if ((isShiftPressed || isImage) && originalWidth > 0 && originalHeight > 0) height = width / (originalWidth / originalHeight);
        }
        if (height < MIN_OBJ_SIZE) {
            height = MIN_OBJ_SIZE;
            if ((isShiftPressed || isImage) && originalWidth > 0 && originalHeight > 0) width = height * (originalWidth / originalHeight);
        }

        if (resizeHandle.includes('W')) {
            x = originalX + (originalWidth - width);
        }
        if (resizeHandle.includes('N')) {
            y = originalY + (originalHeight - height);
        }
        if ((isShiftPressed || isImage) && (resizeHandle === 'N' || resizeHandle === 'S')) {
            x = originalX + (originalWidth - width) / 2;
        }
        if ((isShiftPressed || isImage) && (resizeHandle === 'W' || resizeHandle === 'E')) {
            y = originalY + (originalHeight - height) / 2;
        }

        setDesignData(prev => {
            let newObj: DesignElement = { ...dragObjectStartPos, x, y, width, height };

            if (newObj.type === ToolType.Polygon || newObj.type === ToolType.Pen) {
                const initialWidth = dragObjectStartPos.width;
                const initialHeight = dragObjectStartPos.height;

                if (initialWidth > 0 && initialHeight > 0) {
                    const scaleX = width / initialWidth;
                    const scaleY = height / initialHeight;
                    
                    if (newObj.type === ToolType.Polygon) {
                        const originalPoints = (dragObjectStartPos as PolygonElement).points;
                        newObj.points = originalPoints.map(p => ({
                            x: p.x * scaleX,
                            y: p.y * scaleY
                        }));
                    } else if (newObj.type === ToolType.Pen) {
                        const originalPoints = getPointsFromPath((dragObjectStartPos as PathElement).d);
                        const scaledPoints = originalPoints.map(p => ({
                            x: p.x * scaleX,
                            y: p.y * scaleY
                        }));
                        newObj.d = updatePathWithNewPoints(scaledPoints);
                    }
                }
            }
            
            const newData = { ...prev, [activeId]: newObj };

            if (!isImage && newObj.linkedObj && prev[newObj.linkedObj]) {
              const linked = { ...prev[newObj.linkedObj], x, y, width, height };
              if (linked.type === ToolType.Text) {
                const { spans, requiredHeight } = createTextBoxes(linked as TextElement, newData);
                linked.text = spans;
                const mainObj = newData[activeId] as RectElement;
                if (mainObj.autoHeight) {
                    mainObj.height = requiredHeight;
                }
              }
              newData[newObj.linkedObj] = linked;
            }
            return newData;
        });
        return;
    }
    if (isDragging && activeId && dragMouseStartPos && historyInitialState.current) {
      const dx = mousePos.x - dragMouseStartPos.x;
      const dy = mousePos.y - dragMouseStartPos.y;
      
      setDesignData(prev => {
        const startObject = dragObjectStartPos;
        if (!startObject || startObject.id !== activeId) return prev;

        const newX = startObject.x + dx;
        const newY = startObject.y + dy;
        const obj = { ...prev[activeId], x: newX, y: newY };
        const newData = { ...prev, [activeId]: obj };

        if (!imageEditModeId && obj.linkedObj && prev[obj.linkedObj] && historyInitialState.current?.[obj.linkedObj!]) {
            const linkedStartPos = historyInitialState.current[obj.linkedObj!];
            const newLinkedX = linkedStartPos.x + dx;
            const newLinkedY = linkedStartPos.y + dy;
            const linked = { ...prev[obj.linkedObj], x: newLinkedX, y: newLinkedY };
            if (linked.type === ToolType.Text) {
                (linked as TextElement).text = createTextBoxes(linked as TextElement, newData).spans;
            }
            newData[obj.linkedObj] = linked;
        }
        return newData;
      });
      return;
    }
    if (draggedAnchor) {
        const element = designData[draggedAnchor.elementId];
        if (element && (element.type === ToolType.Polygon || element.type === ToolType.Pen)) {
            setDesignData(prev => {
                const newElement = { ...prev[draggedAnchor.elementId] };
                let points: Point[];
                let absolutePoints: Point[];
                
                if (newElement.type === ToolType.Polygon) {
                    const polygon = newElement as PolygonElement;
                    points = [...polygon.points];
                    absolutePoints = points.map(p => ({ x: p.x + polygon.x, y: p.y + polygon.y }));
                    absolutePoints[draggedAnchor.pointIndex] = mousePos;
                } else { // Pen
                    const path = newElement as PathElement;
                    points = getPointsFromPath(path.d);
                    absolutePoints = points.map(p => ({ x: p.x + path.x, y: p.y + path.y }));
                    absolutePoints[draggedAnchor.pointIndex] = mousePos;
                }

                const minX = Math.min(...absolutePoints.map(p => p.x));
                const minY = Math.min(...absolutePoints.map(p => p.y));
                const maxX = Math.max(...absolutePoints.map(p => p.x));
                const maxY = Math.max(...absolutePoints.map(p => p.y));
                const relativePoints = absolutePoints.map(p => ({ x: p.x - minX, y: p.y - minY }));

                newElement.x = minX;
                newElement.y = minY;
                newElement.width = maxX - minX;
                newElement.height = maxY - minY;

                if (newElement.type === ToolType.Polygon) (newElement as PolygonElement).points = relativePoints;
                else (newElement as PathElement).d = updatePathWithNewPoints(relativePoints);

                return { ...prev, [draggedAnchor.elementId]: newElement as DesignElement };
            });
        }
        return;
    }
    if (isDrawing) {
        if (currentTool === ToolType.Select) {
            setSelection(s => ({ ...s, width: mousePos.x - s.startX, height: mousePos.y - s.startY, x: Math.min(mousePos.x, s.startX), y: Math.min(mousePos.y, s.startY) }));
        } else if (currentTool === ToolType.Pen) {
            setCurrentPath(prev => `${prev} L ${mousePos.x} ${mousePos.y}`);
        }
    }
  }, [getMousePosition, isPanning, panStart, isResizing, selectedObjId, imageEditModeId, resizeHandle, dragObjectStartPos, dragMouseStartPos, isDragging, draggedAnchor, designData, isDrawing, currentTool, pinchStateRef, zoom, panOffset]);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    pinchStateRef.isPinching = false;
    const wasCreatingShape = isDrawing && isResizing && [ToolType.Rect, ToolType.Ellipse, ToolType.Image].includes(currentTool);
    const activeId = imageEditModeId || selectedObjId;

    if ('touches' in e && e.touches.length > 0) {
        return;
    }

    if (isPanning) {
      setIsPanning(false);
    } else if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      if (historyInitialState.current) {
        if (wasCreatingShape && selectedObjId && designData[selectedObjId]) {
          const obj = designData[selectedObjId];
          if (obj.width < MIN_OBJ_SIZE || obj.height < MIN_OBJ_SIZE) {
            setDesignData(historyInitialState.current); // Revert
          } else {
            setHistory(prev => ({ past: [...prev.past, historyInitialState.current!], future: [] }));
          }
        } else {
          setHistory(prev => ({ past: [...prev.past, historyInitialState.current!], future: [] }));
        }
        historyInitialState.current = null;
      }
    } else if (isDragging && activeId) {
        setIsDragging(false);
        if (historyInitialState.current) {
            const initialObj = historyInitialState.current[activeId];
            const finalObj = designData[activeId];
            if (initialObj && finalObj && (initialObj.x !== finalObj.x || initialObj.y !== finalObj.y)) {
                setHistory(prev => ({
                    past: [...prev.past, historyInitialState.current!],
                    future: [],
                }));
            }
        }
        historyInitialState.current = null;
    } else if (draggedAnchor) {
        if (historyInitialState.current) {
            setHistory(prev => ({
                past: [...prev.past, historyInitialState.current!],
                future: [],
            }));
        }
        historyInitialState.current = null;
        setDraggedAnchor(null);
    } else if (isDrawing) {
        if (selection.select) {
            setSelection({ ...selection, select: false });
        } else if (currentTool === ToolType.Pen && currentPath) {
            const points = getPointsFromPath(currentPath);
            if(points.length > 1) {
                const newElementId = getNextShapeId(designData, currentTool);
                const zIndex = getMaxZIndex(designData) + 1;
                const minX = Math.min(...points.map(p => p.x));
                const minY = Math.min(...points.map(p => p.y));
                const newPath: PathElement = {
                    id: newElementId, type: ToolType.Pen,
                    d: updatePathWithNewPoints(points.map(p => ({ x: p.x - minX, y: p.y - minY }))),
                    x: minX, y: minY,
                    width: Math.max(...points.map(p => p.x)) - minX,
                    height: Math.max(...points.map(p => p.y)) - minY,
                    fill: 'transparent', stroke: 'black', strokeWidth: 2, zIndex,
                    strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false,
                    linkedObj: null, layerId: activeLayerId!,
                };
                updateDesignDataWithHistory(prev => ({ ...prev, [newElementId]: newPath }));
            }
            setCurrentPath('');
        }
    }

    if(isDrawing) {
      if (currentTool !== ToolType.Polygon) setIsDrawing(false);
    }
    if (wasCreatingShape || currentTool === ToolType.Select || currentTool === ToolType.Pen) {
      setCurrentTool(ToolType.Select);
    }

    setDragObjectStartPos(null);
    setDragMouseStartPos(null);
  }, [isPanning, isResizing, isDragging, selectedObjId, imageEditModeId, draggedAnchor, isDrawing, currentTool, selection, designData, updateDesignDataWithHistory, currentPath, activeLayerId, pinchStateRef]);

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Zoom on Ctrl + Scroll
    if (e.ctrlKey) {
        const svg = svgRef.current;
        if (!svg) return;
        
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const svgPoint = point.matrixTransform(ctm.inverse());
    
        const oldZoom = zoom;
        const zoomFactor = 1.1;
        let newZoom = oldZoom;
    
        if (e.deltaY < 0) { // Scrolling up, zoom in
            newZoom = oldZoom * zoomFactor;
        } else { // Scrolling down, zoom out
            newZoom = Math.max(0.1, oldZoom / zoomFactor);
        }
        
        newZoom = Math.max(0.1, Math.min(newZoom, 20));
    
        const worldX = (svgPoint.x - (PADDING + panOffset.x)) / oldZoom;
        const worldY = (svgPoint.y - (PADDING + panOffset.y)) / oldZoom;
    
        const newPanX = svgPoint.x - worldX * newZoom - PADDING;
        const newPanY = svgPoint.y - worldY * newZoom - PADDING;
    
        setZoom(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
        return;
    }

    // Pan on regular scroll
    setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
    }));
  }, [zoom, panOffset, svgRef]);

  const zoomIn = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = svg.clientWidth / 2;
    point.y = svg.clientHeight / 2;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const svgPoint = point.matrixTransform(ctm.inverse());
    const oldZoom = zoom;
    let newZoom = oldZoom * 1.2;
    newZoom = Math.max(0.1, Math.min(newZoom, 20));
    
    const worldX = (svgPoint.x - (PADDING + panOffset.x)) / oldZoom;
    const worldY = (svgPoint.y - (PADDING + panOffset.y)) / oldZoom;

    const newPanX = svgPoint.x - worldX * newZoom - PADDING;
    const newPanY = svgPoint.y - worldY * newZoom - PADDING;

    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  }, [zoom, panOffset, svgRef]);

  const zoomOut = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const point = svg.createSVGPoint();
    point.x = svg.clientWidth / 2;
    point.y = svg.clientHeight / 2;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const svgPoint = point.matrixTransform(ctm.inverse());
    const oldZoom = zoom;
    let newZoom = Math.max(0.1, oldZoom / 1.2);
    newZoom = Math.max(0.1, Math.min(newZoom, 20));
    
    const worldX = (svgPoint.x - (PADDING + panOffset.x)) / oldZoom;
    const worldY = (svgPoint.y - (PADDING + panOffset.y)) / oldZoom;

    const newPanX = svgPoint.x - worldX * newZoom - PADDING;
    const newPanY = svgPoint.y - worldY * newZoom - PADDING;

    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  }, [zoom, panOffset, svgRef]);

  const zoomToFit = useCallback((padding = 0.95) => {
    const playgroundEl = playgroundRef.current;
    if (!playgroundEl || !layout.width || !layout.height) return;

    // Use clientWidth/clientHeight as it represents the drawable area inside borders/padding.
    const availableWidth = playgroundEl.clientWidth;
    const availableHeight = playgroundEl.clientHeight;

    if (availableWidth === 0 || availableHeight === 0) return;

    const scaleX = availableWidth / layout.width;
    const scaleY = availableHeight / layout.height;
    
    const newZoom = Math.min(scaleX, scaleY) * padding;
    setZoom(newZoom);
    
    // Calculate pan offset in SVG units to center the zoomed content
    // within the original layout's bounds inside the SVG's viewBox.
    // The browser will then automatically center the viewBox in the playground container.
    const newPanX = (layout.width * (1 - newZoom)) / 2;
    const newPanY = (layout.height * (1 - newZoom)) / 2;

    setPanOffset({ x: newPanX, y: newPanY });
  }, [layout.width, layout.height]);

  useLayoutEffect(() => {
    const fit = () => zoomToFit(0.95);
    fit();
    window.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
    };
  }, [zoomToFit]);

  const onControlPointDown = useCallback((e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    const activeId = imageEditModeId || selectedObjId;
    if (!activeId) return;
    historyInitialState.current = designData;
    setIsResizing(true);
    setResizeHandle(handle);
    setDragObjectStartPos(designData[activeId]);
    setDragMouseStartPos(getMousePosition(e));
  }, [designData, selectedObjId, imageEditModeId, getMousePosition]);

  const onObjMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (imageEditModeId) setImageEditModeId(null);
    if (currentTool === ToolType.Select && canEditObject(id)) {
        if (permissions === Permission.PARTIAL) {
            setSelectedObjId(id);
            return; 
        }
        historyInitialState.current = designData;
        setSelectedObjId(id);
        setIsDragging(true);
        const obj = designData[id];
        setDragObjectStartPos(obj);
        setDragMouseStartPos(getMousePosition(e));
    }
  }, [currentTool, canEditObject, designData, getMousePosition, imageEditModeId, permissions, setSelectedObjId]);
  
  const onImageMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (imageEditModeId === id && canEditObject(id)) {
        historyInitialState.current = designData;
        setIsDragging(true);
        setDragObjectStartPos(designData[id]);
        setDragMouseStartPos(getMousePosition(e));
    }
  }, [imageEditModeId, canEditObject, designData, getMousePosition]);

  const onObjDblClick = useCallback((id: string) => {
    const obj = designData[id];
    if (obj) {
        if (obj.type === ToolType.Rect && (obj as RectElement).textbox) {
            setEditingTextId(obj.linkedObj);
        } else if (obj.type === ToolType.Rect && (obj as RectElement).photobox) {
            if (!canEditObject(id)) return;
            const imageElement = designData[obj.linkedObj!] as ImageElement;

            if (imageElement && imageElement.themeImage) {
                return; // Do nothing if it's a theme image
            }

            if (imageElement && imageElement.url) {
                setImageEditModeId(imageElement.id);
                setSelectedObjId(null);
            } else if (fileInputRef.current) {
                fileInputRef.current.dataset.objId = obj.linkedObj!;
                fileInputRef.current.dataset.action = 'update';
                fileInputRef.current.click();
            }
        }
    }
  }, [designData, fileInputRef, canEditObject, setEditingTextId, setImageEditModeId, setSelectedObjId]);

  const updateImageFrame = useCallback((imageUrl: string, objId: string, dimensions: { imgWidth: number; imgHeight: number }) => {
    updateDesignDataWithHistory(prev => {
        const imageObj = prev[objId] as ImageElement;
        const frameObj = prev[imageObj.linkedObj!] as RectElement;
        
        const frameAspect = frameObj.width / frameObj.height;
        const imgAspect = dimensions.imgWidth / dimensions.imgHeight;
        
        let newWidth, newHeight, newX, newY;
        
        // This logic ensures the image covers the entire frame, clipping if necessary.
        if (frameAspect > imgAspect) {
            // Frame is wider than the image. To cover, scale image to match frame width.
            // The image height will then be larger than the frame height.
            newWidth = frameObj.width;
            newHeight = frameObj.width / imgAspect;
            newX = frameObj.x;
            newY = frameObj.y + (frameObj.height - newHeight) / 2;
        } else {
            // Frame is taller than (or same aspect as) the image. To cover, scale image to match frame height.
            // The image width will then be larger than the frame width.
            newHeight = frameObj.height;
            newWidth = frameObj.height * imgAspect;
            newY = frameObj.y;
            newX = frameObj.x + (frameObj.width - newWidth) / 2;
        }

        const updatedImage: ImageElement = { ...imageObj, url: imageUrl, themeImage: null, x: newX, y: newY, width: newWidth, height: newHeight, imgWidth: dimensions.imgWidth, imgHeight: dimensions.imgHeight };
        return { ...prev, [objId]: updatedImage };
    });
  }, [updateDesignDataWithHistory]);

  const requestImageUpload = useCallback(() => {
    if (fileInputRef.current) {
        fileInputRef.current.dataset.action = 'new';
        fileInputRef.current.dataset.objId = ''; // clear objId
        fileInputRef.current.dataset.themeSlot = '';
        fileInputRef.current.click();
    }
  }, []);
  
  const updateThemeImage = useCallback((slot: 'primary' | 'secondary', imageUrl: string) => {
    setLayout(prev => ({
        ...prev,
        themeImages: {
            ...prev.themeImages,
            [slot]: imageUrl,
        }
    }));
  }, [setLayout]);

  const requestThemeImageUpload = useCallback((slot: 'primary' | 'secondary') => {
      if (fileInputRef.current) {
          fileInputRef.current.dataset.action = 'theme';
          fileInputRef.current.dataset.themeSlot = slot;
          fileInputRef.current.dataset.objId = '';
          fileInputRef.current.click();
      }
  }, []);

  const applyThemeImage = useCallback((imageElementId: string, themeSlot: 'primary' | 'secondary' | null) => {
    const imageElement = designData[imageElementId] as ImageElement;
    if (!imageElement) return;

    const imageUrl = themeSlot ? layout.themeImages?.[themeSlot] : imageElement.url;

    if (!imageUrl) {
        updateDesignDataWithHistory(prev => ({
            ...prev,
            [imageElementId]: { ...prev[imageElementId] as ImageElement, themeImage: themeSlot }
        }));
        return;
    }

    const img = new Image();
    img.onload = () => {
      updateDesignDataWithHistory(prev => {
        const imageObj = prev[imageElementId] as ImageElement;
        const frameObj = prev[imageObj.linkedObj!] as RectElement;
        if (!frameObj) return prev;

        const dimensions = { imgWidth: img.width, imgHeight: img.height };
        const frameAspect = frameObj.width / frameObj.height;
        const imgAspect = dimensions.imgWidth / dimensions.imgHeight;
        
        let newWidth, newHeight, newX, newY;
        
        if (frameAspect > imgAspect) {
          newWidth = frameObj.width;
          newHeight = frameObj.width / imgAspect;
          newX = frameObj.x;
          newY = frameObj.y + (frameObj.height - newHeight) / 2;
        } else {
          newHeight = frameObj.height;
          newWidth = frameObj.height * imgAspect;
          newY = frameObj.y;
          newX = frameObj.x + (frameObj.width - newWidth) / 2;
        }

        const updatedImage: ImageElement = { 
          ...imageObj, 
          themeImage: themeSlot,
          x: newX, y: newY, width: newWidth, height: newHeight, 
          imgWidth: dimensions.imgWidth, 
          imgHeight: dimensions.imgHeight 
        };
        
        return { ...prev, [imageElementId]: updatedImage };
      });
    };
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

  }, [designData, layout.themeImages, updateDesignDataWithHistory]);


  const bringToFront = useCallback(() => {
    if (!selectedObjId) return;
    const maxZ = getMaxZIndex(designData);
    updateDesignDataWithHistory(prev => ({ ...prev, [selectedObjId]: { ...prev[selectedObjId], zIndex: maxZ + 1 } }));
  }, [selectedObjId, designData, updateDesignDataWithHistory]);

  const sendToBack = useCallback(() => {
    if (!selectedObjId) return;
    const minZ = Math.min(...Object.values(designData).map(o => o.zIndex));
    updateDesignDataWithHistory(prev => ({ ...prev, [selectedObjId]: { ...prev[selectedObjId], zIndex: minZ - 1 } }));
  }, [selectedObjId, designData, updateDesignDataWithHistory]);
  
  const addLayer = useCallback(() => {
    const newLayer: Layer = { id: `layer-${Date.now()}`, name: `Layer ${layers.length + 1}`, visible: true };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  }, [layers]);
  
  const deleteLayer = useCallback((id: string) => {
    if (layers.length <= 1) return;
    setLayers(prev => prev.filter(l => l.id !== id));
    updateDesignDataWithHistory(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
            if (newData[key].layerId === id) delete newData[key];
        });
        return newData;
    });
    if (activeLayerId === id) setActiveLayerId(layers.find(l => l.id !== id)?.id || null);
  }, [layers, activeLayerId, updateDesignDataWithHistory]);
  
  const renameLayer = useCallback((id: string, name: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, name } : l));
  }, []);
  
  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, []);

  const moveObject = useCallback((draggedObjectId: string, targetLayerId: string, targetObjectId: string | null) => {
    updateDesignDataWithHistory(prev => {
        const newData = { ...prev };
        const draggedObject = newData[draggedObjectId];
        if (!draggedObject) return prev;

        const sourceLayerId = draggedObject.layerId;
        const linkedObjectId = draggedObject.linkedObj;

        const objectsToMoveIds = [draggedObjectId];
        if (linkedObjectId && newData[linkedObjectId]) {
            objectsToMoveIds.push(linkedObjectId);
        }

        const objectsToMove = objectsToMoveIds.map(id => newData[id]).sort((a, b) => a.zIndex - b.zIndex);

        objectsToMove.forEach(obj => {
            newData[obj.id] = { ...obj, layerId: targetLayerId };
        });

        if (sourceLayerId !== targetLayerId) {
            const sourceLayerObjects = Object.values(newData)
                .filter(o => o.layerId === sourceLayerId && !objectsToMoveIds.includes(o.id))
                .sort((a, b) => a.zIndex - b.zIndex);

            sourceLayerObjects.forEach((obj, index) => {
                newData[obj.id] = { ...obj, zIndex: index };
            });
        }
        
        const targetLayerObjects = Object.values(newData)
            .filter(o => o.layerId === targetLayerId && !objectsToMoveIds.includes(o.id))
            .sort((a, b) => a.zIndex - b.zIndex);

        let insertIndex = targetObjectId ? targetLayerObjects.findIndex(o => o.id === targetObjectId) : -1;
        if (insertIndex === -1) {
            insertIndex = targetLayerObjects.length;
        }

        targetLayerObjects.splice(insertIndex, 0, ...objectsToMove);
        
        targetLayerObjects.forEach((obj, index) => {
            newData[obj.id] = { ...obj, zIndex: index };
        });

        return newData;
    });
  }, [updateDesignDataWithHistory]);
  
  const onAnchorMouseDown = useCallback((e: React.MouseEvent, elementId: string, pointIndex: number) => {
    e.stopPropagation();
    historyInitialState.current = designData;
    setDraggedAnchor({ elementId, pointIndex });
  }, [designData]);

  const loadDesign = useCallback((design: SavedDesign) => {
    const { designData: data, layout: newLayout, layers: newLayers } = design;

    const newData = JSON.parse(JSON.stringify(data));
    const textElements = Object.values(newData).filter((el: any): el is TextElement => el.type === ToolType.Text);

    for (const textEl of textElements) {
        if (textEl.linkedObj && newData[textEl.linkedObj]) {
            const { spans, requiredHeight } = createTextBoxes(textEl, newData);
            newData[textEl.id] = { ...textEl, text: spans };

            const container = newData[textEl.linkedObj] as RectElement;
            if (container && container.autoHeight) {
                newData[textEl.linkedObj] = { ...container, height: requiredHeight };
            }
        }
    }

    setDesignData(newData);
    setLayout({
      ...newLayout,
      themeColors: newLayout.themeColors || { primary: '#3b82f6', secondary: '#64748b', tertiary: '#ecfdf5' },
      themeImages: newLayout.themeImages || { primary: null, secondary: null }
    });
    setLayers(newLayers || [{ id: `layer-${Date.now()}`, name: 'Layer 1', visible: true }]);
    setActiveLayerId(newLayers?.[0]?.id || null);
    setHistory({ past: [], future: [] });
    setSelectedObjId(null);
    setImageEditModeId(null);
    setEditingTextId(null);
  }, [setDesignData, setLayout, setLayers, setActiveLayerId, setHistory, setSelectedObjId, setImageEditModeId, setEditingTextId]);


  const value: DesignContextState = {
    designData, setDesignData, updateDesignDataWithHistory, layout, setLayout,
    currentTool, setCurrentTool, selectedObjId, setSelectedObjId, imageEditModeId,
    setImageEditModeId, editingTextId, setEditingTextId, svgRef, previewRef, playgroundRef,
    onMouseDown, onMouseMove, onMouseUp, onWheel, onControlPointDown, onObjMouseDown,
    onImageMouseDown, onObjDblClick, onDrawingFinish, fileInputRef, updateImageFrame, requestImageUpload,
    bringToFront, sendToBack, cursorPosition, undo, redo, canUndo: history.past.length > 0,
    canRedo: history.future.length > 0, permissions, setPermissions, canEditObject,
    selection, zoom, setZoom, zoomIn, zoomOut, zoomToFit, panOffset, setPanOffset, isPanning, layoutDesigns,
    designs, onLayoutSave, onDesignSave, onLayoutDelete, onDesignDelete, layers,
    setLayers, activeLayerId, setActiveLayerId, addLayer, deleteLayer,
    renameLayer, toggleLayerVisibility, deleteObject, currentPath,
    currentPolygonPoints, onAnchorMouseDown, loadDesign, requestThemeImageUpload, updateThemeImage, applyThemeImage,
    moveObject,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
};
