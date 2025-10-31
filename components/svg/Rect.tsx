import React from 'react';
import { RectElement } from '../../types';

interface RectProps extends RectElement {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

const RectComponent: React.FC<RectProps> = ({ id, x, y, height, width, fill, stroke, strokeWidth, fillOpacity, strokeOpacity, onMouseDown, onDoubleClick, photobox, clipPath, borderRadius }) => {
  const cursorClass = onMouseDown ? (photobox ? 'cursor-pointer' : 'cursor-move') : '';
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    onMouseDown?.(e, id);
  };
  return (
    <rect
      x={x} y={y} height={Math.max(0, height)} width={Math.max(0, width)}
      rx={borderRadius || 0}
      fill={fill ?? 'transparent'} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      fillOpacity={fillOpacity}
      strokeOpacity={strokeOpacity}
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      onDoubleClick={e => onDoubleClick?.(e)}
      className={cursorClass}
      style={clipPath ? { clipPath } : undefined}
    />
  );
};

export default RectComponent;