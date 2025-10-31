import React from 'react';
import { PolygonElement } from '../../types';

interface PolygonProps extends PolygonElement {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

const PolygonComponent: React.FC<PolygonProps> = ({ id, x, y, points, fill, stroke, strokeWidth, fillOpacity, strokeOpacity, onMouseDown }) => {
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  const finalTransform = `translate(${x || 0}, ${y || 0})`;
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    onMouseDown?.(e, id);
  };

  return (
    <polygon
      points={pointsString}
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

export default PolygonComponent;