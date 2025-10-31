import React from 'react';
import { DesignData, Layout, ToolType, DesignElement, RectElement, ImageElement, TextElement } from '../../types';
import RectComponent from '../svg/Rect';
import EllipseComponent from '../svg/Ellipse';

interface PreviewProps {
  designData: DesignData;
  layout: Layout;
}

const Preview: React.FC<PreviewProps> = ({ designData, layout }) => {
  const sortedElements = React.useMemo(() =>
    Object.values(designData).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    [designData]
  );

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          {Object.values(designData)
            .filter((obj): obj is RectElement => obj.type === ToolType.Rect && !!obj.photobox)
            .map(obj => (
              <clipPath key={`preview_${obj.id}_clip`} id={`preview_${obj.id}_clip`}>
                <rect x={obj.x} y={obj.y} width={obj.width} height={obj.height} rx={obj.borderRadius || 0}/>
              </clipPath>
            ))
          }
           {Object.values(designData)
            .filter((obj): obj is RectElement => obj.type === ToolType.Rect && !!obj.textbox)
            .map(obj => (
              <clipPath key={`preview_text_${obj.id}_clip`} id={`preview_text_${obj.id}_clip`}>
                <rect x={obj.x} y={obj.y} width={obj.width} height={obj.height} rx={obj.borderRadius || 0}/>
              </clipPath>
            ))
          }
        </defs>
        <rect width={layout.width} height={layout.height} fill={layout.backgroundColor || "white"} />
        {sortedElements.map(obj => {
          switch (obj.type) {
            case ToolType.Rect: return <RectComponent key={obj.id} {...obj} />;
            case ToolType.Ellipse: return <EllipseComponent key={obj.id} {...obj} />;
            case ToolType.Image: {
              const imageEl = obj as ImageElement;
              const frameRect = imageEl.linkedObj ? designData[imageEl.linkedObj] as RectElement : null;
              if (!frameRect) return null;

              const finalUrl = imageEl.themeImage ? layout.themeImages?.[imageEl.themeImage] : imageEl.url;
              
              return (
                <g key={imageEl.id}>
                  <rect
                    x={frameRect.x} y={frameRect.y} width={frameRect.width} height={frameRect.height}
                    fill={frameRect.fill ?? 'transparent'} fillOpacity={frameRect.fillOpacity}
                    stroke={frameRect.stroke} strokeWidth={frameRect.strokeWidth} strokeOpacity={frameRect.strokeOpacity}
                    rx={frameRect.borderRadius || 0}
                  />
                  {finalUrl && (
                    <image 
                      href={finalUrl} 
                      x={imageEl.x} y={imageEl.y} 
                      height={imageEl.height} width={imageEl.width} 
                      clipPath={`url(#preview_${frameRect.id}_clip)`} 
                      crossOrigin="anonymous"
                    />
                  )}
                </g>
              );
            }
            case ToolType.Text: {
              const textEl = obj as TextElement;
              if (!textEl.linkedObj) return null;
              return (
                <g key={textEl.id} clipPath={`url(#preview_text_${textEl.linkedObj}_clip)`}>
                  <text style={{ pointerEvents: 'none' }}>
                    {textEl.text.map(({ text, x, y, fontSize, fontFamily, fill, stroke, strokeWidth }, i) => (
                      <tspan 
                        key={`${textEl.id}_${i}`} 
                        x={x} y={y} fontSize={fontSize} fontFamily={fontFamily} 
                        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
                      >
                        {text}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            }
            default: return null;
          }
        })}
      </svg>
    </div>
  );
};

export default Preview;