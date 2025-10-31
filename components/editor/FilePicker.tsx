import React from 'react';
import { useDesignState } from '../../context/DesignContext';
import { getNextShapeId, getMaxZIndex } from '../../utils/shapes';
import { ImageElement, RectElement, ToolType } from '../../types';

const FilePicker: React.FC = () => {
  const { fileInputRef, updateImageFrame, updateDesignDataWithHistory, designData, layout, activeLayerId, setSelectedObjId, updateThemeImage } = useDesignState();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const action = fileInputRef.current?.dataset.action;
    const objId = fileInputRef.current?.dataset.objId;
    const themeSlot = fileInputRef.current?.dataset.themeSlot as 'primary' | 'secondary' | undefined;

    if (file && action) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            if (action === 'update' && objId) {
              updateImageFrame(base64Image, objId, { imgWidth: img.width, imgHeight: img.height });
            } else if (action === 'theme' && themeSlot) {
              updateThemeImage(themeSlot, base64Image);
            } else if (action === 'new') {
              updateDesignDataWithHistory(prev => {
                const MAX_SIZE = 300;
                let width = img.width;
                let height = img.height;

                if (width > MAX_SIZE || height > MAX_SIZE) {
                  const ratio = width / height;
                  if (ratio > 1) { // landscape
                    width = MAX_SIZE;
                    height = MAX_SIZE / ratio;
                  } else { // portrait or square
                    height = MAX_SIZE;
                    width = MAX_SIZE * ratio;
                  }
                }

                const x = (layout.width - width) / 2;
                const y = (layout.height - height) / 2;
                const maxZIndex = getMaxZIndex(prev);
                const imageZIndex = maxZIndex + 1;
                const boxZIndex = maxZIndex + 2;

                const imageId = getNextShapeId(prev, ToolType.Image);
                const boxId = getNextShapeId({ ...prev, [imageId]: {} as any }, ToolType.Rect);

                const newImage: ImageElement = {
                  id: imageId, type: ToolType.Image, linkedObj: boxId,
                  x, y, width, height, zIndex: imageZIndex, edit: true, seal: false,
                  url: base64Image, imgWidth: img.width, imgHeight: img.height,
                  layerId: activeLayerId!, fill: null, stroke: 'none', strokeWidth: 0,
                  strokeOpacity: 1, fillOpacity: 1,
                };
                const newBox: RectElement = {
                  id: boxId, type: ToolType.Rect, photobox: true,
                  x, y, width, height, zIndex: boxZIndex, linkedObj: imageId,
                  fill: null, stroke: 'white', strokeWidth: 10, edit: true, seal: false,
                  strokeOpacity: 1, fillOpacity: 1, borderRadius: 5, layerId: activeLayerId!,
                };
                
                setTimeout(() => setSelectedObjId(boxId), 0);
                
                return { ...prev, [imageId]: newImage, [boxId]: newBox };
              });
            }
          };
          img.src = base64Image;
        };
        reader.readAsDataURL(file);
        event.target.value = ""; // Reset input
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }
  };

  return <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />;
};

export default FilePicker;