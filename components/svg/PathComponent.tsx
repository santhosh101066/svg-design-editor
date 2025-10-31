import React from 'react';
import { PathElement } from '../../types';

interface PathProps extends PathElement {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

const PathComponent: React.FC<PathProps> = ({ id, x, y, d, fill, stroke, strokeWidth, fillOpacity, strokeOpacity, onMouseDown }) => {
  const finalTransform = `translate(${x || 0}, ${y || 0})`;
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    onMouseDown?.(e, id);
  };

  return (
    <path
      d={d}
      fill={fill ?? 'transparent'}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fillOpacity={fillOpacity}
      strokeOpacity={strokeOpacity}
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      className={onMouseDown ? 'cursor-move' : ''}
      transform={finalTransform}
    />
  );
};

export default PathComponent;