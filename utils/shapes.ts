import { DesignData, Point } from '../types';

export const getNextShapeId = (obj: DesignData, prefix: string): string => {
  let max = 0;
  for (const key in obj) {
    if (key.startsWith(prefix)) {
      const num = parseInt(key.replace(prefix, ''), 10);
      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  }
  return `${prefix}${max + 1}`;
};

// FIX: Export getPointsFromPath function.
export const getPointsFromPath = (d: string): Point[] => {
    if (!d) return [];
    const points: Point[] = [];
    const pointString = d.replace(/[MLZ]/ig, '').trim();
    if (!pointString) return [];
    const coords = pointString.split(/[ ,]+/);
    for (let i = 0; i < coords.length; i += 2) {
        if (coords[i] && coords[i+1]) {
            points.push({ x: parseFloat(coords[i]), y: parseFloat(coords[i+1]) });
        }
    }
    return points;
};

// FIX: Export updatePathWithNewPoints function.
export const updatePathWithNewPoints = (points: Point[]): string => {
    if (points.length === 0) return '';
    const M = `M ${points[0].x} ${points[0].y}`;
    const Ls = points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    return `${M} ${Ls}`.trim();
};

export const getMaxZIndex = (data: DesignData): number => {
    if (Object.keys(data).length === 0) {
        return 0;
    }
    const zIndexes = Object.values(data).map(obj => obj.zIndex);
    return Math.max(...zIndexes);
};