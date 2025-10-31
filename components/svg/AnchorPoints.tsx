

import React from 'react';
import { PolygonElement, PathElement, ToolType } from '../../types';
import { getPointsFromPath } from '../../utils/shapes';

interface AnchorPointsProps {
  element: PolygonElement | PathElement;
  onAnchorMouseDown: (e: React.MouseEvent, elementId: string, pointIndex: number) => void;
}

const AnchorPoints: React.FC<AnchorPointsProps> = ({ element, onAnchorMouseDown }) => {
  const points = element.type === ToolType.Polygon 
    ? (element as PolygonElement).points.map(p => ({ x: p.x + element.x, y: p.y + element.y }))
    : getPointsFromPath((element as PathElement).d).map(p => ({ x: p.x + element.x, y: p.y + element.y }));

  return (
    <g>
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={5}
          fill="white"
          stroke="#0ea5e9"
          strokeWidth={1}
          className="cursor-move"
          onMouseDown={(e) => onAnchorMouseDown(e, element.id, index)}
        />
      ))}
    </g>
  );
};

export default AnchorPoints;
