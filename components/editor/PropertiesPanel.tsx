

import React, { useState, useEffect } from 'react';
import { useDesignState } from '../../context/DesignContext';
import { GOOGLE_FONTS } from '../../constants';
import { Permission, ToolType, RectElement, TextElement, ImageElement } from '../../types';
import { LayerUpIcon, LayerDownIcon, UploadIcon } from '../icons';
import { createTextBoxes } from '../../utils/text';

const PropertiesPanel: React.FC = () => {
    const { 
        designData, selectedObjId, setDesignData, updateDesignDataWithHistory, 
        layout, setLayout, bringToFront, sendToBack, fileInputRef, permissions, 
        canEditObject, imageEditModeId, requestImageUpload, requestThemeImageUpload, applyThemeImage
    } = useDesignState();

    const objId = imageEditModeId || selectedObjId;
    const obj = objId ? designData[objId] : null;

    const [fillInputType, setFillInputType] = useState<'theme' | 'custom'>('custom');
    const [strokeInputType, setStrokeInputType] = useState<'theme' | 'custom'>('custom');

    useEffect(() => {
        if (obj) {
            setFillInputType(obj.fillThemeColor ? 'theme' : 'custom');
            setStrokeInputType(obj.strokeThemeColor ? 'theme' : 'custom');
        }
    }, [objId, obj?.fillThemeColor, obj?.strokeThemeColor]);

    const buttonClasses = "w-full flex items-center justify-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100";
    
    if (!obj) {
        return (
            <div className="w-full md:w-72 h-auto md:h-full bg-white shadow-lg flex-shrink-0 overflow-y-auto">
                <PropertySection title="Layout">
                    <PropertyInput label="Width" disabled={permissions !== Permission.FULL}>
                        <input type="number" value={layout.width} onChange={e => setLayout(l => ({...l, width: +e.target.value}))} disabled={permissions !== Permission.FULL}/>
                    </PropertyInput>
                    <PropertyInput label="Height" disabled={permissions !== Permission.FULL}>
                        <input type="number" value={layout.height} onChange={e => setLayout(l => ({...l, height: +e.target.value}))} disabled={permissions !== Permission.FULL}/>
                    </PropertyInput>
                </PropertySection>
                <PropertySection title="Theme Colors">
                    <PropertyInput label="Primary" disabled={permissions !== Permission.FULL} variant="color">
                        <input type="color" value={layout.themeColors?.primary} onChange={e => setLayout(l => ({...l, themeColors: {...l.themeColors!, primary: e.target.value}}))} className="w-9 h-9 p-0 cursor-pointer" disabled={permissions !== Permission.FULL}/>
                    </PropertyInput>
                    <PropertyInput label="Secondary" disabled={permissions !== Permission.FULL} variant="color">
                        <input type="color" value={layout.themeColors?.secondary} onChange={e => setLayout(l => ({...l, themeColors: {...l.themeColors!, secondary: e.target.value}}))} className="w-9 h-9 p-0 cursor-pointer" disabled={permissions !== Permission.FULL}/>
                    </PropertyInput>
                    <PropertyInput label="Tertiary" disabled={permissions !== Permission.FULL} variant="color">
                        <input type="color" value={layout.themeColors?.tertiary} onChange={e => setLayout(l => ({...l, themeColors: {...l.themeColors!, tertiary: e.target.value}}))} className="w-9 h-9 p-0 cursor-pointer" disabled={permissions !== Permission.FULL}/>
                    </PropertyInput>
                </PropertySection>
                <PropertySection title="Theme Images">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                            {layout.themeImages?.primary 
                                ? <img src={layout.themeImages.primary} alt="Primary theme image" className="w-full h-full object-cover"/> 
                                : <span className="text-xs text-gray-500">Primary</span>
                            }
                        </div>
                        <button onClick={() => requestThemeImageUpload('primary')} className={buttonClasses} disabled={permissions !== Permission.FULL}>
                            <UploadIcon /> {layout.themeImages?.primary ? 'Change' : 'Upload'}
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                            {layout.themeImages?.secondary 
                                ? <img src={layout.themeImages.secondary} alt="Secondary theme image" className="w-full h-full object-cover"/> 
                                : <span className="text-xs text-gray-500">Secondary</span>
                            }
                        </div>
                        <button onClick={() => requestThemeImageUpload('secondary')} className={buttonClasses} disabled={permissions !== Permission.FULL}>
                            <UploadIcon /> {layout.themeImages?.secondary ? 'Change' : 'Upload'}
                        </button>
                    </div>
                </PropertySection>
                <PropertySection title="Actions">
                    <button onClick={requestImageUpload} className={buttonClasses} disabled={permissions !== Permission.FULL}>
                        <UploadIcon /> Upload Image
                    </button>
                </PropertySection>
            </div>
        );
    }
    
    const targetTextElement = 
        (obj.type === ToolType.Rect && (obj as RectElement).textbox) ? designData[obj.linkedObj!] as TextElement : 
        obj.type === ToolType.Text ? obj as TextElement : null;
    
    const targetImageElement = 
        (obj.type === ToolType.Rect && (obj as RectElement).photobox) ? designData[obj.linkedObj!] as ImageElement :
        obj.type === ToolType.Image ? obj as ImageElement : null;

    const frameObj = 
        (obj.type === ToolType.Rect && ((obj as RectElement).photobox || (obj as RectElement).textbox)) ? obj as RectElement :
        ((obj.type === ToolType.Image || obj.type === ToolType.Text) && obj.linkedObj) ? designData[obj.linkedObj] as RectElement : null;

    const isTransformDisabled = !canEditObject(objId) || 
                                (permissions === Permission.PARTIAL && !!frameObj) || 
                                obj.type === ToolType.Image;

    const handleNumericChange = (id: string, prop: string, value: string) => {
        setDesignData(prev => ({...prev, [id]: {...prev[id], [prop]: Number(value)}}));
    };

    const handlePropertyChange = (id: string, prop: string, value: any, isHistoryCommit: boolean = false) => {
        setDesignData(prev => ({...prev, [id]: {...prev[id], [prop]: value}}));
        if (isHistoryCommit) {
            updateDesignDataWithHistory(d => d);
        }
    };
    
    const updateTextAndContainer = (textId: string, updatedProps: Partial<TextElement>) => {
        setDesignData(prev => {
            const newDesignData = { ...prev };
            const textElement = newDesignData[textId] as TextElement;
            if (!textElement || textElement.type !== ToolType.Text) return prev;
            const updatedTextElement = { ...textElement, ...updatedProps };
            const container = newDesignData[updatedTextElement.linkedObj!] as RectElement;
            const { spans, requiredHeight } = createTextBoxes(updatedTextElement, newDesignData);
            
            newDesignData[textId] = { ...updatedTextElement, text: spans };
            
            if (container) {
                const shouldUpdateHeight = container.autoHeight !== false;
                newDesignData[updatedTextElement.linkedObj!] = {
                    ...container,
                    height: shouldUpdateHeight ? requiredHeight : container.height
                };
            }
            return newDesignData;
        });
    };

    const isRect = obj.type === ToolType.Rect;
    const isGenericShape = [ToolType.Rect, ToolType.Ellipse, ToolType.Pen, ToolType.Polygon].includes(obj.type) && !(obj as RectElement).photobox && !(obj as RectElement).textbox;

    const fillTitle = targetTextElement ? 'Container Fill' : targetImageElement ? 'Frame Fill' : 'Fill';
    const strokeTitle = targetTextElement ? 'Container Stroke' : targetImageElement ? 'Frame Stroke' : 'Stroke';

    const renderColorInput = (
      type: 'fill' | 'stroke',
      inputType: 'theme' | 'custom',
      setInputType: (type: 'theme' | 'custom') => void
    ) => {
      const targetObj = (type === 'fill' && frameObj) || (type === 'stroke' && frameObj) || obj;
      const themeColorProp = `${type}ThemeColor`;

      return (
          <>
              <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" value="theme" checked={inputType === 'theme'} onChange={() => setInputType('theme')} disabled={!canEditObject(objId)} />
                      Theme
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" value="custom" checked={inputType === 'custom'} onChange={() => { setInputType('custom'); handlePropertyChange(targetObj.id, themeColorProp, null, true); }} disabled={!canEditObject(objId)} />
                      Custom
                  </label>
              </div>
              {inputType === 'theme' ? (
                  <div className="flex justify-start gap-2">
                      {(['primary', 'secondary', 'tertiary'] as const).map(theme => (
                          <button
                              key={theme}
                              onClick={() => {
                                  handlePropertyChange(targetObj.id, themeColorProp, theme);
                                  handlePropertyChange(targetObj.id, type, layout.themeColors![theme], true);
                              }}
                              style={{ backgroundColor: layout.themeColors![theme] }}
                              className={`w-8 h-8 rounded-full border-2 ${targetObj[themeColorProp] === theme ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                              title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                              disabled={!canEditObject(objId)}
                          />
                      ))}
                  </div>
              ) : (
                  <PropertyInput label="Color" disabled={!canEditObject(objId)} variant="color">
                      <input type="color" value={targetObj[type] ?? (type === 'fill' ? '#ffffff' : '#000000')} onChange={e => { handlePropertyChange(targetObj.id, type, e.target.value); handlePropertyChange(targetObj.id, themeColorProp, null); }} onBlur={() => updateDesignDataWithHistory(d => d)} className="w-9 h-9 p-0 cursor-pointer" disabled={!canEditObject(objId)} />
                  </PropertyInput>
              )}
          </>
      );
    };

    return (
        <div className="w-full md:w-72 h-auto md:h-full bg-white shadow-lg flex-shrink-0 overflow-y-auto">
            <PropertySection title="Transform">
                <div className="grid grid-cols-2 gap-3">
                    <PropertyInput label="X" disabled={isTransformDisabled}><input type="number" value={Math.round(obj.x)} onChange={e => handleNumericChange(objId!, 'x', e.target.value)} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={isTransformDisabled} /></PropertyInput>
                    <PropertyInput label="Y" disabled={isTransformDisabled}><input type="number" value={Math.round(obj.y)} onChange={e => handleNumericChange(objId!, 'y', e.target.value)} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={isTransformDisabled} /></PropertyInput>
                    <PropertyInput label="Width" disabled={isTransformDisabled}><input type="number" value={Math.round(obj.width)} onChange={e => handleNumericChange(objId!, 'width', e.target.value)} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={isTransformDisabled} /></PropertyInput>
                    <PropertyInput label="Height" disabled={isTransformDisabled}><input type="number" value={Math.round(obj.height)} onChange={e => handleNumericChange(objId!, 'height', e.target.value)} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={isTransformDisabled} /></PropertyInput>
                </div>
            </PropertySection>

            <PropertySection title="Arrange">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={bringToFront} className={buttonClasses} disabled={!canEditObject(obj.id)}><LayerUpIcon /> Front</button>
                    <button onClick={sendToBack} className={buttonClasses} disabled={!canEditObject(obj.id)}><LayerDownIcon /> Back</button>
                </div>
            </PropertySection>

            {(isGenericShape || frameObj) && (
                 <>
                    <PropertySection title={fillTitle}>
                        {renderColorInput('fill', fillInputType, setFillInputType)}
                        <PropertyInput label={`Opacity: ${Math.round((frameObj || obj).fillOpacity * 100)}%`} disabled={!canEditObject(objId)}>
                            <input type="range" min="0" max="1" step="0.01" value={(frameObj || obj).fillOpacity} onChange={e => handlePropertyChange((frameObj || obj).id, 'fillOpacity', +e.target.value)} onMouseUp={() => updateDesignDataWithHistory(d => d)} disabled={!canEditObject(objId)}/>
                        </PropertyInput>
                    </PropertySection>
                    <PropertySection title={strokeTitle}>
                        <div className="flex items-center justify-between">
                            <label className={`text-sm font-medium ${!canEditObject(objId) ? 'text-gray-400' : 'text-gray-700'}`}>Enable Stroke</label>
                            <input type="checkbox" checked={(frameObj || obj).strokeWidth > 0} onChange={e => { handlePropertyChange((frameObj || obj).id, 'strokeWidth', e.target.checked ? 1 : 0); updateDesignDataWithHistory(d => d); }} disabled={!canEditObject(objId)} />
                        </div>
                        {(frameObj || obj).strokeWidth > 0 && (
                            <>
                                {renderColorInput('stroke', strokeInputType, setStrokeInputType)}
                                <PropertyInput label="Width" disabled={!canEditObject(objId)}><input type="number" min="0" value={(frameObj || obj).strokeWidth} onChange={e => handleNumericChange((frameObj || obj).id, 'strokeWidth', e.target.value)} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={!canEditObject(objId)}/></PropertyInput>
                                <PropertyInput label={`Opacity: ${Math.round((frameObj || obj).strokeOpacity * 100)}%`} disabled={!canEditObject(objId)}>
                                    <input type="range" min="0" max="1" step="0.01" value={(frameObj || obj).strokeOpacity} onChange={e => handlePropertyChange((frameObj || obj).id, 'strokeOpacity', +e.target.value)} onMouseUp={() => updateDesignDataWithHistory(d => d)} disabled={!canEditObject(objId)}/>
                                </PropertyInput>
                            </>
                        )}
                    </PropertySection>
                 </>
            )}

            {(isRect || frameObj?.type === ToolType.Rect) && (
              <PropertySection title="Corners">
                <PropertyInput label="Border Radius" disabled={!canEditObject(objId)}><input type="number" min="0" value={(frameObj || obj as RectElement).borderRadius || 0} onChange={e => handleNumericChange((frameObj || obj).id, 'borderRadius', e.target.value)} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={!canEditObject(objId)}/></PropertyInput>
              </PropertySection>
            )}

            {targetTextElement && (
                <PropertySection title="Text">
                    <div className="p-2 bg-gray-100 rounded-md text-center text-sm text-gray-600">
                        Double-click on the canvas to edit text.
                    </div>
                    <PropertyInput label="Font Size" disabled={!canEditObject(targetTextElement.id)}>
                        <input type="number" min="1" value={targetTextElement.fontSize} onChange={e => updateTextAndContainer(targetTextElement.id, { fontSize: +e.target.value })} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={!canEditObject(targetTextElement.id)} />
                    </PropertyInput>
                    <PropertyInput label="Font Family" disabled={!canEditObject(targetTextElement.id)}>
                        <select value={targetTextElement.fontFamily} onChange={e => updateTextAndContainer(targetTextElement.id, { fontFamily: e.target.value })} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={!canEditObject(targetTextElement.id)}>{GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                    </PropertyInput>
                    <PropertyInput label="Fill Color" disabled={!canEditObject(targetTextElement.id)} variant="color">
                        <input type="color" value={targetTextElement.fill} onChange={e => updateTextAndContainer(targetTextElement.id, { fill: e.target.value })} onBlur={() => updateDesignDataWithHistory(d => d)} className="w-9 h-9 p-0 cursor-pointer" disabled={!canEditObject(targetTextElement.id)} />
                    </PropertyInput>
                    <PropertyInput label="Stroke Color" disabled={!canEditObject(targetTextElement.id)} variant="color">
                        <input type="color" value={targetTextElement.stroke} onChange={e => updateTextAndContainer(targetTextElement.id, { stroke: e.target.value })} onBlur={() => updateDesignDataWithHistory(d => d)} className="w-9 h-9 p-0 cursor-pointer" disabled={!canEditObject(targetTextElement.id)} />
                    </PropertyInput>
                    <PropertyInput label="Stroke Width" disabled={!canEditObject(targetTextElement.id)}>
                        <input type="number" min="0" value={targetTextElement.strokeWidth} onChange={e => updateTextAndContainer(targetTextElement.id, { strokeWidth: +e.target.value })} onBlur={() => updateDesignDataWithHistory(d => d)} disabled={!canEditObject(targetTextElement.id)}/>
                    </PropertyInput>
                </PropertySection>
            )}

            {targetImageElement && (
                <PropertySection title="Image">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Source</label>
                        <select
                            value={targetImageElement.themeImage || 'custom'}
                            onChange={e => {
                                const value = e.target.value;
                                const theme = value === 'custom' ? null : value as 'primary' | 'secondary';
                                applyThemeImage(targetImageElement.id, theme);
                            }}
                            disabled={!canEditObject(targetImageElement.id)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        >
                            <option value="custom">Custom Image</option>
                            <option value="primary">Primary Theme Image</option>
                            <option value="secondary">Secondary Theme Image</option>
                        </select>
                    </div>

                    {targetImageElement.themeImage === null &&
                        <button
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.dataset.objId = targetImageElement.id;
                                    fileInputRef.current.dataset.action = 'update';
                                    fileInputRef.current.click();
                                }
                            }}
                            className={`${buttonClasses} mt-3`}
                            disabled={!canEditObject(targetImageElement.id)}
                        >
                            <UploadIcon /> {targetImageElement.url ? 'Change Image' : 'Upload Image'}
                        </button>
                    }
                </PropertySection>
            )}

        </div>
    );
};

const PropertySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-b border-gray-200 px-4 py-3">
        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">{title}</h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const PropertyInput: React.FC<{ label: string; disabled?: boolean; children: React.ReactElement; variant?: 'default' | 'color' }> = ({ label, disabled, children, variant = 'default' }) => {
    const child = React.Children.only(children);
    const childProps = child.props as any;
    const isDisabled = disabled || childProps.disabled;

    if (variant === 'color') {
        return (
            <div className="flex justify-between items-center">
                <label className={`text-sm font-medium text-gray-700 ${isDisabled ? 'text-gray-400' : ''}`}>{label}</label>
                {React.cloneElement(child, {
                    ...childProps,
                    className: `${childProps.className || ''} rounded-md border border-gray-300 shadow-sm ${isDisabled ? 'cursor-not-allowed' : ''}`
                })}
            </div>
        );
    }

    return (
        <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${isDisabled ? 'text-gray-400' : ''}`}>{label}</label>
            {React.cloneElement(child, {
                ...childProps,
                className: `${childProps.className || ''} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${isDisabled ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'bg-gray-50'}`
            })}
        </div>
    );
};

export default PropertiesPanel;