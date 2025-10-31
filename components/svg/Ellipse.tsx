import React from 'react';
import { EllipseElement } from '../../types';

interface EllipseProps extends EllipseElement {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

const EllipseComponent: React.FC<EllipseProps> = ({ id, x, y, height, width, fill, stroke, strokeWidth, fillOpacity, strokeOpacity, onMouseDown }) => {
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    onMouseDown?.(e, id);
  };
  return (
    <ellipse
      cx={x + width / 2} cy={y + height / 2}
      rx={Math.max(0, width / 2)} ry={Math.max(0, height / 2)}
      fill={fill ?? 'transparent'} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      fillOpacity={fillOpacity}
      strokeOpacity={strokeOpacity}
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      className={onMouseDown ? 'cursor-move' : ''}
    />
  );
};

export default EllipseComponent;