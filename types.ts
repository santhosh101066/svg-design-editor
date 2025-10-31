

export enum ToolType {
  Select = 'select',
  Pan = 'pan',
  Rect = 'rect',
  Ellipse = 'ellipse',
  Text = 'text',
  Image = 'image',
  Pen = 'pen',
  Polygon = 'polygon',
}

export enum Permission {
  FULL = 'full',
  PARTIAL = 'partial',
  READONLY = 'read-only',
}

export interface Tool {
  name: string;
  type: ToolType;
}

export interface Point {
  x: number;
  y: number;
}

export interface Layout {
  height: number;
  width: number;
  backgroundColor?: string;
  themeColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  themeImages?: {
    primary: string | null;
    secondary: string | null;
  };
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export interface BaseElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  height: number;
  width: number;
  strokeWidth: number;
  fill: string | null;
  stroke: string;
  zIndex: number;
  strokeOpacity: number;
  fillOpacity: number;
  edit: boolean;
  seal: boolean;
  linkedObj: string | null;
  layerId: string;
  fillThemeColor?: 'primary' | 'secondary' | 'tertiary' | null;
  strokeThemeColor?: 'primary' | 'secondary' | 'tertiary' | null;
}

export interface RectElement extends BaseElement {
  type: ToolType.Rect;
  photobox?: boolean;
  textbox?: boolean;
  autoHeight?: boolean;
  clipPath?: string;
  borderRadius?: number;
}

export interface EllipseElement extends BaseElement {
  type: ToolType.Ellipse;
}

export interface ImageElement extends BaseElement {
  type: ToolType.Image;
  url?: string;
  imgWidth?: number;
  imgHeight?: number;
  themeImage?: 'primary' | 'secondary' | null;
}

export interface TextSpan {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextElement extends BaseElement {
  type: ToolType.Text;
  text: TextSpan[];
  fontSize: number;
  fontFamily: string;
  rawText: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface PathElement extends BaseElement {
  type: ToolType.Pen;
  d: string;
}

export interface PolygonElement extends BaseElement {
  type: ToolType.Polygon;
  points: Point[];
}

export type DesignElement = RectElement | EllipseElement | ImageElement | TextElement | PathElement | PolygonElement;

export type DesignData = Record<string, DesignElement>;

export interface SelectionBox {
  select: boolean;
  x: number;
  y: number;
  height: number;
  width: number;
  startX: number;
  startY: number;
}

export type ResizeHandle = 'NW' | 'NE' | 'SE' | 'SW' | 'N' | 'E' | 'S' | 'W';

export interface SavedDesign {
  designData: DesignData;
  layout: Layout;
  layers: Layer[];
}

export type Anchor = {
  elementId: string;
  pointIndex: number;
};