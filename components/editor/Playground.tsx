import React from 'react';
import { useDesignState } from '../../context/DesignContext';
import { PADDING } from '../../constants';
import { DesignElement, ToolType as TT, Permission, RectElement, PolygonElement, PathElement, ImageElement } from '../../types';
import RectComponent from '../svg/Rect';
import EllipseComponent from '../svg/Ellipse';
import ImageFrame from '../svg/ImageFrame';
import TextBox from '../svg/TextBox';
import PathComponent from '../svg/PathComponent';
import PolygonComponent from '../svg/PolygonComponent';
import ControlPoints from '../svg/ControlPoints';
import SelectionBox from '../svg/SelectionBox';
import { ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from '../icons';
import FilePicker from './FilePicker';
import TextEditorOverlay from './TextEditorOverlay';
import AnchorPoints from '../svg/AnchorPoints';

const Playground: React.FC = () => {
  const {
    layout, svgRef, playgroundRef, onMouseDown, onMouseMove, onMouseUp, onWheel, designData, onObjMouseDown, onImageMouseDown, onObjDblClick,
    currentTool, zoom, setZoom, zoomIn, zoomOut, zoomToFit, panOffset, setPanOffset, isPanning, permissions, layers, selectedObjId,
    cursorPosition, currentPath, currentPolygonPoints, onDrawingFinish, onAnchorMouseDown
  } = useDesignState();

  const elementsByLayer = React.useMemo(() => {
    const grouped: Record<string, DesignElement[]> = {};
    for (const element of Object.values(designData)) {
      if (!element.layerId) continue;
      if (!grouped[element.layerId]) {
        grouped[element.layerId] = [];
      }
      grouped[element.layerId].push(element);
    }
    for (const layerId in grouped) {
      grouped[layerId].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    }
    return grouped;
  }, [designData]);
  
  const playgroundClasses = `
    flex-1 h-full p-0 md:p-4 overflow-hidden bg-gray-200 flex items-center justify-center relative select-none
    ${isPanning ? 'cursor-grabbing' : ''}
    ${currentTool === TT.Pan ? 'cursor-grab' : ''}
    ${currentTool === TT.Select ? 'cursor-default' : 'cursor-crosshair'}
  `;

  const bleedLineWidth = 1 / zoom;
  const selectedObject = selectedObjId ? designData[selectedObjId] : null;

  return (
    <div 
      ref={playgroundRef}
      className={playgroundClasses} 
      onMouseDown={onMouseDown} 
      onMouseMove={onMouseMove} 
      onMouseUp={onMouseUp} 
      onMouseLeave={onMouseUp} 
      onTouchStart={onMouseDown}
      onTouchMove={onMouseMove}
      onTouchEnd={onMouseUp}
      onDoubleClick={onDrawingFinish} 
      onWheel={onWheel}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${layout.width + PADDING * 2} ${layout.height + PADDING * 2}`}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          {Object.values(designData).filter(obj => obj.type === TT.Rect && obj.photobox).map(obj => (
            <clipPath key={obj.id + "_clip"} id={obj.id + "_clip"}>
              <rect x={obj.x} y={obj.y} width={obj.width} height={obj.height} rx={(obj as RectElement).borderRadius || 0}/>
            </clipPath>
          ))}
          {Object.values(designData).filter(obj => obj.type === TT.Rect && obj.textbox).map(obj => (
            <clipPath key={obj.id + "_text_clip"} id={obj.id + "_text_clip"}>
                <rect x={obj.x} y={obj.y} width={obj.width} height={obj.height} rx={(obj as RectElement).borderRadius || 0}/>
            </clipPath>
          ))}
          <clipPath id="layout-clip">
              <rect x="0" y="0" width={layout.width} height={layout.height} />
          </clipPath>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge> 
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${PADDING + panOffset.x}, ${PADDING + panOffset.y}) scale(${zoom})`}>
          <rect
            x="0"
            y="0"
            width={layout.width}
            height={layout.height}
            fill="white"
            filter="url(#shadow)"
          />

          <g id="user-content-group" clipPath={permissions !== Permission.FULL ? "url(#layout-clip)" : undefined}>
            {layers.slice().reverse().map(layer => (
              layer.visible && (
                <g key={layer.id}>
                  {(elementsByLayer[layer.id] || []).map((obj: DesignElement) => {
                    switch (obj.type) {
                      case TT.Rect: {
                        const rectObj = obj as RectElement;
                        if (rectObj.photobox) {
                          // All rendering for photoboxes is handled by the ImageFrame component
                          // which is rendered for the associated ImageElement.
                          return null;
                        }
                        return <RectComponent key={obj.id} {...obj} onMouseDown={onObjMouseDown} onDoubleClick={() => onObjDblClick(obj.id)} />;
                      }
                      case TT.Ellipse:
                        return <EllipseComponent key={obj.id} {...obj} onMouseDown={onObjMouseDown} />;
                      case TT.Image:
                        return <ImageFrame key={obj.id} {...obj} onMouseDown={onObjMouseDown} onImageMouseDown={onImageMouseDown} onDoubleClick={onObjDblClick} />;
                      case TT.Text:
                        return <TextBox key={obj.id} {...obj} onMouseDown={onObjMouseDown} />;
                      case TT.Pen:
                        return <PathComponent key={obj.id} {...obj} onMouseDown={onObjMouseDown} />;
                      case TT.Polygon:
                        return <PolygonComponent key={obj.id} {...obj} onMouseDown={onObjMouseDown} />;
                      default: return null;
                    }
                  })}
                </g>
              )
            ))}
            {currentPath && <path d={currentPath} fill="none" stroke="black" strokeWidth="2" />}
            {currentPolygonPoints.length > 0 && (
              <g>
                <polyline points={currentPolygonPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="black" strokeWidth="1" strokeDasharray="2,2" />
                {currentPolygonPoints.length > 1 && (
                  <line x1={currentPolygonPoints[currentPolygonPoints.length - 1].x} y1={currentPolygonPoints[currentPolygonPoints.length - 1].y} x2={cursorPosition.x} y2={cursorPosition.y} stroke="black" strokeWidth="1" strokeDasharray="2,2" />
                )}
              </g>
            )}
          </g>
          
          <rect
            x="0"
            y="0"
            width={layout.width}
            height={layout.height}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={bleedLineWidth}
            strokeDasharray={`${4 / zoom} ${4 / zoom}`}
            style={{ pointerEvents: 'none' }}
          />

          <ControlPoints />
          {(selectedObject?.type === TT.Polygon || selectedObject?.type === TT.Pen) && <AnchorPoints element={selectedObject as PolygonElement | PathElement} onAnchorMouseDown={onAnchorMouseDown} />}
          <SelectionBox />
        </g>
      </svg>
      <div className="absolute bottom-20 right-4 md:bottom-6 md:right-6 flex items-center gap-1 bg-white p-1 rounded-lg shadow-md">
        <button onClick={zoomOut} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md" title="Zoom Out"><ZoomOutIcon /></button>
        <button onClick={() => zoomToFit(0.95)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md" title="Fit to Screen"><ResetZoomIcon /></button>
        <button onClick={zoomIn} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md" title="Zoom In"><ZoomInIcon /></button>
        <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} className="p-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md" title="Zoom to 100%">100%</button>
      </div>
      <FilePicker/>
      <TextEditorOverlay />
    </div>
  );
};

export default Playground;