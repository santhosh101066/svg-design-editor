import React from 'react';
import { useDesignState } from '../../context/DesignContext';
import { ResizeHandle, Permission, ToolType } from '../../types';

const ControlPoints: React.FC = () => {
  const { designData, selectedObjId, onControlPointDown, canEditObject, permissions, imageEditModeId } = useDesignState();
  
  const targetId = imageEditModeId || selectedObjId;
  const obj = targetId ? designData[targetId] : null;

  if (!obj || !canEditObject(targetId)) return null;
  
  if (permissions === Permission.PARTIAL && obj.type !== ToolType.Image) {
    return null;
  }

  const handles: ResizeHandle[] = ['NW', 'NE', 'SE', 'SW', 'N', 'E', 'S', 'W'];
  const getHandleProps = (handle: ResizeHandle) => {
    const handleSize = 12;
    const props: { x: number, y: number, cursor: string } = { x: 0, y: 0, cursor: ''};
    const halfWidth = obj.width / 2;
    const halfHeight = obj.height / 2;
    if (handle.includes('N')) { props.y = obj.y - handleSize / 2; props.cursor += 'n'; }
    if (handle.includes('S')) { props.y = obj.y + obj.height - handleSize / 2; props.cursor += 's'; }
    if (handle.includes('W')) { props.x = obj.x - handleSize / 2; props.cursor += 'w'; }
    if (handle.includes('E')) { props.x = obj.x + obj.width - handleSize / 2; props.cursor += 'e'; }
    if (handle === 'N' || handle === 'S') props.x = obj.x + halfWidth - handleSize / 2;
    if (handle === 'E' || handle === 'W') props.y = obj.y + halfHeight - handleSize / 2;
    props.cursor += '-resize';
    return {...props, size: handleSize};
  };

  return (
    <g>
      <rect x={obj.x} y={obj.y} height={obj.height} width={obj.width} fill="none" stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3,3" style={{ pointerEvents: 'none' }}/>
      {handles.map(handle => {
        const { x, y, cursor, size } = getHandleProps(handle);
        return (
          <rect key={handle} x={x} y={y} height={size} width={size} fill="white" stroke="#0ea5e9" strokeWidth={1}
            onMouseDown={e => onControlPointDown(e, handle)}
            onTouchStart={e => onControlPointDown(e, handle)}
            className={`cursor-${cursor}`}
          />
        );
      })}
    </g>
  );
};

export default ControlPoints;