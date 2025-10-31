
import React from 'react';
import { useDesignState } from '../../context/DesignContext';

const SelectionBox: React.FC = () => {
  const { selection: { select, x, y, height, width } } = useDesignState();
  if (!select) return null;
  return (
    <rect x={x} y={y} height={height} width={width} fill="rgba(14, 165, 233, 0.2)" stroke="#0ea5e9" strokeWidth={1} />
  );
};

export default SelectionBox;
