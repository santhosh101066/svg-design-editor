import React from 'react';
import { useDesignState } from '../../context/DesignContext';
import { ImageElement, RectElement } from '../../types';
import { ImageIcon } from '../icons';

interface ImageFrameProps extends ImageElement {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  onImageMouseDown?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  onDoubleClick?: (id: string) => void;
}

const ImageFrame: React.FC<ImageFrameProps> = ({ id, x, y, height, width, url, themeImage, linkedObj, onMouseDown, onImageMouseDown, onDoubleClick }) => {
  const { designData, imageEditModeId, layout } = useDesignState();
  const frameRect = linkedObj ? designData[linkedObj] as RectElement : null;

  if (!frameRect) return null;

  const DivWithXmlns = 'div' as any;
  const isEditingThisImage = imageEditModeId === id;
  const finalUrl = themeImage ? layout.themeImages?.[themeImage] : url;
  
  const handleImageInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isEditingThisImage) {
      onImageMouseDown?.(e, id);
    } else {
      onMouseDown?.(e, frameRect.id);
    }
  };
  
  const handleFrameInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    onMouseDown?.(e, frameRect.id);
  }

  return (
    <g onDoubleClick={() => onDoubleClick?.(frameRect.id)}>
      {finalUrl ? (
        <g>
            {/* Render the frame background and stroke first */}
            <rect
                x={frameRect.x}
                y={frameRect.y}
                width={frameRect.width}
                height={frameRect.height}
                fill={frameRect.fill ?? 'transparent'}
                fillOpacity={frameRect.fillOpacity}
                stroke={frameRect.stroke}
                strokeWidth={frameRect.strokeWidth}
                strokeOpacity={frameRect.strokeOpacity}
                rx={frameRect.borderRadius || 0}
                style={{ pointerEvents: 'none' }}
            />
            {/* Render the image on top, clipped to the frame */}
            <image 
              href={finalUrl} 
              x={x} y={y} 
              height={height} width={width} 
              clipPath={`url(#${frameRect.id}_clip)`} 
              onMouseDown={handleImageInteractionStart}
              onTouchStart={handleImageInteractionStart}
              className={isEditingThisImage ? "cursor-grab" : "cursor-pointer"}
              style={{ pointerEvents: 'all' }}
              crossOrigin="anonymous"
            />
        </g>
      ) : (
        <g 
          onMouseDown={handleFrameInteractionStart} 
          onTouchStart={handleFrameInteractionStart}
          className="cursor-pointer"
        >
          <rect
            x={frameRect.x} y={frameRect.y} height={frameRect.height} width={frameRect.width}
            fill={frameRect.fill ?? '#e5e7eb'} 
            stroke={frameRect.strokeWidth > 0 ? frameRect.stroke : '#a0aec0'} 
            strokeWidth={frameRect.strokeWidth > 0 ? frameRect.strokeWidth : 1}
            strokeDasharray={frameRect.strokeWidth > 0 ? "none" : "4 4"}
            rx={frameRect.borderRadius || 0}
          />
          <foreignObject x={frameRect.x} y={frameRect.y} width={frameRect.width} height={frameRect.height}>
            <DivWithXmlns xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-2 text-center select-none">
                <ImageIcon/>
                <span style={{ fontSize: '12px', marginTop: '4px' }}>Double-click to add image</span>
            </DivWithXmlns>
          </foreignObject>
        </g>
      )}
    </g>
  );
};

export default ImageFrame;