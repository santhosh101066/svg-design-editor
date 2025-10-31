import React from 'react';
import { useDesignState } from '../../context/DesignContext';
import { TextElement } from '../../types';

interface TextBoxProps extends TextElement {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

const TextBox: React.FC<TextBoxProps> = ({ id, text, onMouseDown, linkedObj }) => {
  const { editingTextId } = useDesignState();
  const isEditing = editingTextId === id;

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); 
    onMouseDown?.(e, linkedObj!);
  };

  return (
    <g 
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      onDragStart={e => e.preventDefault()} 
      className={onMouseDown ? 'cursor-move' : ''} 
      style={{ userSelect: 'none', visibility: isEditing ? 'hidden' : 'visible' }}
      clipPath={`url(#${linkedObj}_text_clip)`}
    >
      <text style={{ pointerEvents: 'none' }}>
        {text.map(({ text, x, y, fontSize, fontFamily, fill, stroke, strokeWidth }, i) => (
          <tspan 
            key={`${id}_${i}`} 
            x={x} 
            y={y} 
            fontSize={fontSize} 
            fontFamily={fontFamily} 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          >
            {text}
          </tspan>
        ))}
      </text>
    </g>
  );
};

export default TextBox;