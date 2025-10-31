
import React from 'react';
// FIX: Import DesignElement for use in the updated assignLayer function signature.
import { Tool, ToolType, DesignData, Layout, Layer, DesignElement, BaseElement } from './types';
import { SelectIcon, HandIcon, RectIcon, EllipseIcon, TextIcon, ImageFrameIcon, PenIcon, PolygonIcon } from './components/icons';

export const SelectTool: Tool = { name: 'Select', type: ToolType.Select };
export const PanTool: Tool = { name: 'Pan', type: ToolType.Pan };
export const RectTool: Tool = { name: 'Rect', type: ToolType.Rect };
export const EllipseTool: Tool = { name: 'Ellipse', type: ToolType.Ellipse };
export const TextTool: Tool = { name: 'Text', type: ToolType.Text };
export const ImageTool: Tool = { name: 'Image', type: ToolType.Image };
export const PenTool: Tool = { name: 'Pen', type: ToolType.Pen };
export const PolygonTool: Tool = { name: 'Polygon', type: ToolType.Polygon };

export const ToolIcons: Record<ToolType, React.ReactNode> = {
  [ToolType.Select]: <SelectIcon />,
  [ToolType.Pan]: <HandIcon />,
  [ToolType.Rect]: <RectIcon />,
  [ToolType.Ellipse]: <EllipseIcon />,
  [ToolType.Image]: <ImageFrameIcon />,
  [ToolType.Text]: <TextIcon />,
  [ToolType.Pen]: <PenIcon />,
  [ToolType.Polygon]: <PolygonIcon />,
};

export const ToolsList: Tool[] = [
  SelectTool,
  PanTool,
  RectTool,
  EllipseTool,
  TextTool,
  ImageTool,
  PenTool,
  PolygonTool,
];

export const GOOGLE_FONTS: string[] = [
  'Arial', 'Roboto', 'Lato', 'Montserrat', 'Oswald', 'Playfair Display', 'Merriweather', 'Noto Sans', 'Cursive', 'Fantasy'
];

export const MIN_SHAPE_SIZE = 10;
export const PADDING = 200;
export const MIN_OBJ_SIZE = 10;

// Editor now starts with a blank canvas
export const INITIAL_DATA: DesignData = {};

interface Template {
  name: string;
  layout: Layout;
  layers: Layer[];
  designData: DesignData;
}

const defaultLayerId = 'layer1';
const defaultLayers: Layer[] = [{ id: defaultLayerId, name: 'Layer 1', visible: true }];
// FIX: Corrected the type of `data` to be less strict to avoid errors with TypeScript's excess property checking on union types for object literals.
const assignLayer = (data: Record<string, Omit<BaseElement, 'layerId'> & { [key: string]: any }>): DesignData => {
  const layeredData: DesignData = {};
  for (const key in data) {
    layeredData[key] = { ...data[key], layerId: defaultLayerId } as DesignElement;
  }
  return layeredData;
};

const themeColors = { primary: '#2d3748', secondary: '#a0aec0', tertiary: '#ffffff' };

export const TEMPLATES: Template[] = [
  {
    name: "Classic Split (Top)",
    layout: { width: 800, height: 600, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
      primaryPanel: { id: "pPanel", type: ToolType.Rect, x: 0, y: 0, width: 343, height: 600, fill: themeColors.primary, fillThemeColor: 'primary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
      secondaryPanel: { id: "sPanel", type: ToolType.Rect, x: 343, y: 0, width: 457, height: 600, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
      mainImg: { id: "mainImg", type: ToolType.Image, x: 400, y: 100, width: 343, height: 400, zIndex: 20, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 400, y: 100, width: 343, height: 400, zIndex: 21, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
      circleImg: { id: "circleImg", type: ToolType.Image, themeImage: "primary", x: 96, y: 75, width: 150, height: 150, zIndex: 20, linkedObj: "circleImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      circleImgBox: { id: "circleImgBox", type: ToolType.Rect, photobox: true, x: 96, y: 75, width: 150, height: 150, zIndex: 21, borderRadius: 75, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'circleImg' },
    }),
  },
  {
    name: "Classic Split (Divider, Top)",
    layout: { width: 800, height: 600, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
        primaryPanel: { id: "pPanel", type: ToolType.Rect, x: 0, y: 0, width: 338, height: 600, fill: themeColors.primary, fillThemeColor: 'primary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        secondaryPanel: { id: "sPanel", type: ToolType.Rect, x: 347, y: 0, width: 453, height: 600, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        divider: { id: "divider", type: ToolType.Rect, x: 338, y: 0, width: 9, height: 600, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: "none", zIndex: 15, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        mainImg: { id: "mainImg", type: ToolType.Image, x: 402, y: 100, width: 343, height: 400, zIndex: 20, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 402, y: 100, width: 343, height: 400, zIndex: 21, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
        circleImg: { id: "circleImg", type: ToolType.Image, themeImage: "primary", x: 94, y: 75, width: 150, height: 150, zIndex: 20, linkedObj: "circleImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        circleImgBox: { id: "circleImgBox", type: ToolType.Rect, photobox: true, x: 94, y: 75, width: 150, height: 150, zIndex: 21, borderRadius: 75, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'circleImg' },
    }),
  },
  {
    name: "Photo Strip Portrait",
    layout: { width: 600, height: 800, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
        background: { id: "background", type: ToolType.Rect, x: 0, y: 0, width: 600, height: 800, fill: themeColors.tertiary, fillThemeColor: 'tertiary', stroke: "none", zIndex: 10, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
        mainPanel: { id: "mainPanel", type: ToolType.Rect, x: 200, y: 0, width: 400, height: 800, fill: themeColors.primary, fillThemeColor: 'primary', stroke: "none", zIndex: 11, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        stripBorderLeft: { id: "stripBorderLeft", type: ToolType.Rect, x: 192, y: 0, width: 8, height: 800, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: "none", zIndex: 12, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        img1: { id: "img1", type: ToolType.Image, x: 25, y: 29, width: 150, height: 229, zIndex: 20, linkedObj: "img1Box", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        img1Box: { id: "img1Box", type: ToolType.Rect, photobox: true, x: 25, y: 29, width: 150, height: 229, zIndex: 21, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img1' },
        img2: { id: "img2", type: ToolType.Image, x: 25, y: 271, width: 150, height: 229, zIndex: 20, linkedObj: "img2Box", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        img2Box: { id: "img2Box", type: ToolType.Rect, photobox: true, x: 25, y: 271, width: 150, height: 229, zIndex: 21, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img2' },
        img3: { id: "img3", type: ToolType.Image, x: 25, y: 514, width: 150, height: 229, zIndex: 20, linkedObj: "img3Box", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        img3Box: { id: "img3Box", type: ToolType.Rect, photobox: true, x: 25, y: 514, width: 150, height: 229, zIndex: 21, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img3' },
    }),
  },
  {
    name: "Classic Split (Bottom)",
    layout: { width: 800, height: 600, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
        primaryPanel: { id: "pPanel", type: ToolType.Rect, x: 0, y: 0, width: 343, height: 600, fill: themeColors.primary, fillThemeColor: 'primary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        secondaryPanel: { id: "sPanel", type: ToolType.Rect, x: 343, y: 0, width: 457, height: 600, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        mainImg: { id: "mainImg", type: ToolType.Image, x: 400, y: 100, width: 343, height: 400, zIndex: 20, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 400, y: 100, width: 343, height: 400, zIndex: 21, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
        circleImg: { id: "circleImg", type: ToolType.Image, themeImage: "primary", x: 96, y: 375, width: 150, height: 150, zIndex: 20, linkedObj: "circleImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        circleImgBox: { id: "circleImgBox", type: ToolType.Rect, photobox: true, x: 96, y: 375, width: 150, height: 150, zIndex: 21, borderRadius: 75, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'circleImg' },
    }),
  },
  {
    name: "Classic Split (Divider, Bottom)",
    layout: { width: 800, height: 600, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
        primaryPanel: { id: "pPanel", type: ToolType.Rect, x: 0, y: 0, width: 338, height: 600, fill: themeColors.primary, fillThemeColor: 'primary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        secondaryPanel: { id: "sPanel", type: ToolType.Rect, x: 347, y: 0, width: 453, height: 600, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: "none", zIndex: 10, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        divider: { id: "divider", type: ToolType.Rect, x: 338, y: 0, width: 9, height: 600, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: "none", zIndex: 15, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
        mainImg: { id: "mainImg", type: ToolType.Image, x: 402, y: 100, width: 343, height: 400, zIndex: 20, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 402, y: 100, width: 343, height: 400, zIndex: 21, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
        circleImg: { id: "circleImg", type: ToolType.Image, themeImage: "primary", x: 94, y: 375, width: 150, height: 150, zIndex: 20, linkedObj: "circleImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        circleImgBox: { id: "circleImgBox", type: ToolType.Rect, photobox: true, x: 94, y: 375, width: 150, height: 150, zIndex: 21, borderRadius: 75, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'circleImg' },
    }),
  },
  {
    name: "Four Square Collage",
    layout: { width: 600, height: 800, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
      background: { id: "background", type: ToolType.Rect, x: 0, y: 0, width: 600, height: 800, fill: themeColors.tertiary, fillThemeColor: 'tertiary', stroke: "none", zIndex: 10, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      bottomPanel: { id: "bPanel", type: ToolType.Rect, x: 0, y: 629, width: 600, height: 171, fill: themeColors.primary, fillThemeColor: 'primary', stroke: "none", zIndex: 11, edit: true, seal: false, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, linkedObj: null },
      img1: { id: "img1", type: ToolType.Image, x: 25, y: 29, width: 263, height: 271, zIndex: 20, linkedObj: "img1Box", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      img1Box: { id: "img1Box", type: ToolType.Rect, photobox: true, x: 25, y: 29, width: 263, height: 271, zIndex: 21, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img1' },
      img2: { id: "img2", type: ToolType.Image, x: 313, y: 29, width: 263, height: 271, zIndex: 20, linkedObj: "img2Box", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      img2Box: { id: "img2Box", type: ToolType.Rect, photobox: true, x: 313, y: 29, width: 263, height: 271, zIndex: 21, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img2' },
      img3: { id: "img3", type: ToolType.Image, x: 25, y: 329, width: 263, height: 271, zIndex: 20, linkedObj: "img3Box", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      img3Box: { id: "img3Box", type: ToolType.Rect, photobox: true, x: 25, y: 329, width: 263, height: 271, zIndex: 21, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img3' },
      img4: { id: "img4", type: ToolType.Image, x: 313, y: 329, width: 263, height: 271, zIndex: 20, linkedObj: "img4Box", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      img4Box: { id: "img4Box", type: ToolType.Rect, photobox: true, x: 313, y: 329, width: 263, height: 271, zIndex: 21, fill: themeColors.secondary, fillThemeColor: 'secondary', stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img4' },
      circleImg: { id: "img5", type: ToolType.Image, x: 250, y: 265, width: 100, height: 100, zIndex: 30, linkedObj: "img5Box", themeImage: "primary", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      circleImgBox: { id: "img5Box", type: ToolType.Rect, photobox: true, x: 250, y: 265, width: 100, height: 100, zIndex: 31, fill: themeColors.tertiary, fillThemeColor: 'tertiary', borderRadius: 50, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'img5' },
    }),
  },
  {
    name: "Modern White Split",
    layout: { width: 800, height: 600, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
        background: { id: "bg", type: ToolType.Rect, x: 0, y: 0, width: 800, height: 600, fill: themeColors.tertiary, fillThemeColor: 'tertiary', zIndex: 10, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
        primaryPanel: { id: "pPanel", type: ToolType.Rect, x: 29, y: 25, width: 357, height: 550, fill: themeColors.primary, fillThemeColor: 'primary', zIndex: 11, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
        secondaryPanel: { id: "sPanel", type: ToolType.Rect, x: 414, y: 25, width: 357, height: 550, fill: themeColors.secondary, fillThemeColor: 'secondary', zIndex: 11, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
        mainImg: { id: "mainImg", type: ToolType.Image, x: 429, y: 38, width: 329, height: 525, zIndex: 20, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 429, y: 38, width: 329, height: 525, zIndex: 21, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
        circleImg: { id: "circleImg", type: ToolType.Image, themeImage: "primary", x: 131, y: 75, width: 150, height: 150, zIndex: 20, linkedObj: "circleImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
        circleImgBox: { id: "circleImgBox", type: ToolType.Rect, photobox: true, x: 131, y: 75, width: 150, height: 150, zIndex: 21, borderRadius: 75, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'circleImg' },
    }),
  },
  {
    name: "Bordered Horizontal",
    layout: { width: 800, height: 600, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
      border: { id: "border", type: ToolType.Rect, x: 0, y: 0, width: 800, height: 600, fill: themeColors.primary, fillThemeColor: 'primary', zIndex: 10, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      background: { id: "bg", type: ToolType.Rect, x: 11, y: 10, width: 777, height: 580, fill: themeColors.tertiary, fillThemeColor: 'tertiary', zIndex: 11, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      secondaryPanel: { id: "sPanel", type: ToolType.Rect, x: 11, y: 10, width: 389, height: 580, fill: themeColors.secondary, fillThemeColor: 'secondary', zIndex: 12, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      mainImg: { id: "mainImg", type: ToolType.Image, x: 69, y: 150, width: 274, height: 300, zIndex: 20, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 69, y: 150, width: 274, height: 300, zIndex: 21, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
      circleImg: { id: "circleImg", type: ToolType.Image, themeImage: "primary", x: 532, y: 238, width: 125, height: 125, zIndex: 20, linkedObj: "circleImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      circleImgBox: { id: "circleImgBox", type: ToolType.Rect, photobox: true, x: 532, y: 238, width: 125, height: 125, zIndex: 21, borderRadius: 63, fill: null, stroke: "none", strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'circleImg' },
    }),
  },
  {
    name: "Minimalist Photo Card",
    layout: { width: 800, height: 600, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
      background: { id: "bg", type: ToolType.Rect, x: 0, y: 0, width: 800, height: 600, fill: themeColors.tertiary, fillThemeColor: 'tertiary', zIndex: 10, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      decoCircle: { id: "deco", type: ToolType.Ellipse, x: 64, y: 50, width: 100, height: 100, fill: themeColors.secondary, fillThemeColor: 'secondary', fillOpacity: 0.5, stroke: "none", zIndex: 15, strokeWidth: 0, strokeOpacity: 1, edit: true, seal: false, linkedObj: null },
      mainImg: { id: "mainImg", type: ToolType.Image, x: 114, y: 100, width: 571, height: 400, zIndex: 20, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 114, y: 100, width: 571, height: 400, zIndex: 21, fill: null, stroke: themeColors.primary, strokeWidth: 6, strokeThemeColor: 'primary', strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
    }),
  },
  {
    name: "Ornate Frame Card",
    layout: { width: 600, height: 800, backgroundColor: '#ffffff', themeColors, themeImages: { primary: null, secondary: null } },
    layers: defaultLayers,
    designData: assignLayer({
      background: { id: "bg", type: ToolType.Rect, x: 0, y: 0, width: 600, height: 800, fill: themeColors.tertiary, fillThemeColor: 'tertiary', zIndex: 5, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      mainImg: { id: "mainImg", type: ToolType.Image, x: 50, y: 50, width: 500, height: 700, zIndex: 10, linkedObj: "mainImgBox", fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      mainImgBox: { id: "mainImgBox", type: ToolType.Rect, photobox: true, x: 50, y: 50, width: 500, height: 700, zIndex: 11, fill: null, stroke: themeColors.tertiary, strokeWidth: 10, strokeThemeColor: 'tertiary', strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'mainImg' },
      secondaryPanel: { id: "sPanel", type: ToolType.Rect, x: 50, y: 600, width: 500, height: 150, fill: themeColors.secondary, fillThemeColor: 'secondary', zIndex: 20, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      decoFrame: { id: "decoFrame", type: ToolType.Pen, x: 150, y: 613, width: 300, height: 125, fill: themeColors.primary, fillThemeColor: 'primary', stroke: 'none', strokeWidth: 0, zIndex: 25, d: "M 150 0 C 112.5 0 75 12.5 75 31.25 C 75 50 112.5 62.5 150 62.5 C 187.5 62.5 225 50 225 31.25 C 225 12.5 187.5 0 150 0 Z M 150 12.5 C 168.75 12.5 187.5 18.75 187.5 31.25 C 187.5 43.75 168.75 50 150 50 C 131.25 50 112.5 43.75 112.5 31.25 C 112.5 18.75 131.25 12.5 150 12.5 Z M 0 50 C 0 37.5 25 31.25 37.5 31.25 L 37.5 50 L 262.5 50 L 262.5 31.25 C 275 31.25 300 37.5 300 50 L 300 125 L 0 125 L 0 50 Z", strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: null },
      circleImg: { id: "circleImg", type: ToolType.Image, x: 250, y: 650, width: 100, height: 50, zIndex: 30, linkedObj: "circleImgBox", themeImage: 'primary', fill: null, stroke: 'none', strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false },
      circleImgBox: { id: "circleImgBox", type: ToolType.Rect, photobox: true, x: 250, y: 650, width: 100, height: 50, zIndex: 31, fill: null, stroke: "none", borderRadius: 25, strokeWidth: 0, strokeOpacity: 1, fillOpacity: 1, edit: true, seal: false, linkedObj: 'circleImg' },
    }),
  },
];
