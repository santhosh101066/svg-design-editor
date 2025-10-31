import React, { useEffect, useRef, useState } from 'react';
import { useDesignState } from '../../context/DesignContext';
import { TextElement, RectElement } from '../../types';
import { PADDING } from '../../constants';
import { createTextBoxes } from '../../utils/text';

const TextEditorOverlay: React.FC = () => {
    const {
        editingTextId, setEditingTextId, designData, setDesignData, updateDesignDataWithHistory,
        svgRef, zoom, panOffset,
    } = useDesignState();

    const [localText, setLocalText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textElement = editingTextId ? designData[editingTextId] as TextElement : null;

    useEffect(() => {
        if (textElement) {
            setLocalText(textElement.rawText);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.select();
                }
            }, 0);
        }
    }, [editingTextId]);

    const handleBlur = () => {
        if (editingTextId) {
            updateDesignDataWithHistory(d => d);
            setEditingTextId(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setLocalText(newText);

        if (editingTextId && textElement) {
            const tempTextElement = { ...textElement, rawText: newText };
            const container = designData[tempTextElement.linkedObj!] as RectElement;
            const { spans, requiredHeight } = createTextBoxes(tempTextElement, designData);
            const shouldUpdateHeight = container.autoHeight !== false;

            setDesignData(prev => ({
                ...prev,
                [editingTextId]: {
                    ...tempTextElement,
                    text: spans,
                },
                [tempTextElement.linkedObj!]: {
                    ...prev[tempTextElement.linkedObj!],
                    height: shouldUpdateHeight ? requiredHeight : prev[tempTextElement.linkedObj!].height,
                }
            }));
        }
    };

    if (!editingTextId || !textElement) return null;

    const containerElement = designData[textElement.linkedObj!] as RectElement;
    const svgNode = svgRef.current;
    const playgroundNode = svgNode?.parentElement;
    
    let editorStyle: React.CSSProperties = { display: 'none' };

    if (svgNode && playgroundNode && containerElement) {
        const ctm = svgNode.getScreenCTM();
        if (ctm) {
            const svgPoint = svgNode.createSVGPoint();
            svgPoint.x = (containerElement.x * zoom) + PADDING + panOffset.x;
            svgPoint.y = (containerElement.y * zoom) + PADDING + panOffset.y;

            const screenPoint = svgPoint.matrixTransform(ctm);
            const playgroundRect = playgroundNode.getBoundingClientRect();
            const padding = 10;

            editorStyle = {
                position: 'absolute',
                left: `${screenPoint.x - playgroundRect.left}px`,
                top: `${screenPoint.y - playgroundRect.top}px`,
                width: `${containerElement.width * zoom}px`,
                height: `${containerElement.height * zoom}px`,
                fontSize: `${textElement.fontSize * zoom}px`,
                fontFamily: textElement.fontFamily,
                // FIX: Use `fill` property for text color, as `fontColor` does not exist on TextElement.
                color: textElement.fill,
                lineHeight: '1.2',
                padding: `${padding * zoom}px`,
                boxSizing: 'border-box',
                border: 'none',
                outline: 'none',
                boxShadow: 'inset 0 0 0 1px #0ea5e9',
                overflow: 'hidden',
                resize: 'none',
                background: 'white',
                zIndex: 100,
                userSelect: 'text',
            };
        }
    }

    return (
        <textarea
            id="text-editor-overlay"
            ref={textareaRef}
            style={editorStyle}
            value={localText}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={(e) => {
                if(e.key === 'Escape') {
                    e.currentTarget.blur();
                }
            }}
        />
    );
};

export default TextEditorOverlay;
