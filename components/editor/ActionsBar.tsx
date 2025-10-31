
import React, { useState, useRef, useEffect } from 'react';
import { useDesignState } from '../../context/DesignContext';
import { UndoIcon, RedoIcon, DownloadIcon, TrashIcon, XIcon, MenuIcon, MoreVertIcon } from '../icons';
import { TEMPLATES } from '../../constants';
import Preview from './Preview';
import { Permission, SavedDesign } from '../../types';

interface ActionsBarProps {
  toggleSidePanel: () => void;
}

const ActionsBar: React.FC<ActionsBarProps> = ({ toggleSidePanel }) => {
  const {
    onLayoutSave, onDesignSave, onLayoutDelete, onDesignDelete,
    layoutDesigns, designs, svgRef, undo, redo, canUndo, canRedo,
    permissions, setPermissions, layout, loadDesign
  } = useDesignState();
  const [modal, setModal] = useState<'designs' | 'layouts' | 'templates' | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // FIX: Corrected typo from moreMenuref to moreMenuRef.
        if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
            setIsMoreMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const downloadPNG = () => {
    const svg = svgRef.current;
    if (!svg) {
      alert("Editor is not ready, please try again.");
      return;
    }
  
    const userContentGroup = svg.querySelector('#user-content-group');
    const defs = svg.querySelector('defs')?.outerHTML || '';

    if (!userContentGroup) {
      alert("Could not find content to export.");
      return;
    }
  
    const cleanSvgString = `<svg width="${layout.width}" height="${layout.height}" xmlns="http://www.w3.org/2000/svg">
      ${defs}
      <rect x="0" y="0" width="${layout.width}" height="${layout.height}" fill="white" />
      ${userContentGroup.innerHTML}
    </svg>`;
    
    const blob = new Blob([cleanSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
  
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = layout.width;
      canvas.height = layout.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'design.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = (e) => {
      console.error("Failed to load SVG image for conversion.", e);
      alert("Could not export PNG. Please try again.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  

  const baseButtonClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2";
  const defaultButtonClass = "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-300";
  const primaryButtonClass = "bg-blue-600 text-white hover:bg-blue-700 shadow-sm";
  const disabledButtonClass = "bg-gray-200 text-gray-400 cursor-not-allowed";

  const renderModalContent = () => {
    if (!modal) return null;

    if (modal === 'templates') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => (
            <div key={template.name} className="relative border rounded-lg overflow-hidden shadow-sm group cursor-pointer" 
                 onClick={() => { 
                    loadDesign(template);
                    setModal(null); 
                 }}>
               <h4 className="font-semibold p-2 text-center bg-gray-50">{template.name}</h4>
              <div className="aspect-w-1 aspect-h-1 bg-gray-50">
                <Preview designData={template.designData} layout={template.layout} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    const isDesigns = modal === 'designs';
    const data: SavedDesign[] = isDesigns ? designs : layoutDesigns;
    
    if (data.length === 0) {
      return <p className="text-gray-500 text-center py-12">No saved {modal}.</p>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((savedDesign, i) => (
          <div key={i} className="relative border rounded-lg overflow-hidden shadow-sm group">
            <div className="aspect-w-1 aspect-h-1 bg-gray-50 cursor-pointer" 
                 onClick={() => { 
                    loadDesign(savedDesign);
                    setModal(null); 
                 }}>
              <Preview designData={savedDesign.designData} layout={savedDesign.layout} />
            </div>
            <button className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); isDesigns ? onDesignDelete(i) : onLayoutDelete(i); }}>
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-16 bg-white shadow-md px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-blue-600 hidden sm:block">SVG Editor</span>
          <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" className={`${baseButtonClass} p-2 ${canUndo ? defaultButtonClass : disabledButtonClass}`}><UndoIcon /></button>
          <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" className={`${baseButtonClass} p-2 ${canRedo ? defaultButtonClass : disabledButtonClass}`}><RedoIcon /></button>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
            <div className="relative">
                <select
                    value={permissions}
                    onChange={(e) => setPermissions(e.target.value as Permission)}
                    className={`${baseButtonClass} ${defaultButtonClass} appearance-none pr-8`}
                    aria-label="Select permission level"
                >
                    <option value={Permission.FULL}>Full Access</option>
                    <option value={Permission.PARTIAL}>Partial Edit</option>
                    <option value={Permission.READONLY}>Read-Only</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>


        <div className="flex items-center gap-2">
          {/* Desktop buttons */}
          <button onClick={() => setModal('templates')} className={`${baseButtonClass} ${defaultButtonClass} hidden md:flex`}>Templates</button>
          <button onClick={onLayoutSave} className={`${baseButtonClass} ${defaultButtonClass} hidden md:flex`}>Save Layout</button>
          <button onClick={onDesignSave} className={`${baseButtonClass} ${defaultButtonClass} hidden md:flex`}>Save Design</button>
          <button onClick={() => setModal("designs")} className={`${baseButtonClass} ${defaultButtonClass} hidden md:flex`}>Designs</button>
          <button onClick={() => setModal("layouts")} className={`${baseButtonClass} ${defaultButtonClass} hidden md:flex`}>Layouts</button>
          
          <button onClick={downloadPNG} className={`${baseButtonClass} ${primaryButtonClass}`}><DownloadIcon /> <span className="hidden sm:inline">Export</span></button>
          
          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            {permissions === Permission.FULL && (
              <button onClick={toggleSidePanel} className={`${baseButtonClass} ${defaultButtonClass}`}>
                  <MenuIcon />
              </button>
            )}
            <div className="relative">
                <button onClick={() => setIsMoreMenuOpen(p => !p)} className={`${baseButtonClass} ${defaultButtonClass} p-2`}>
                    <MoreVertIcon />
                </button>
                {isMoreMenuOpen && (
                    <div ref={moreMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-50 border">
                        <a href="#" onClick={e => { e.preventDefault(); setModal('templates'); setIsMoreMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Templates</a>
                        <a href="#" onClick={e => { e.preventDefault(); setModal('designs'); setIsMoreMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Designs</a>
                        <a href="#" onClick={e => { e.preventDefault(); setModal('layouts'); setIsMoreMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Layouts</a>
                        <div className="my-1 border-t border-gray-100"></div>
                        <a href="#" onClick={e => { e.preventDefault(); onDesignSave(); setIsMoreMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Save Design</a>
                        <a href="#" onClick={e => { e.preventDefault(); onLayoutSave(); setIsMoreMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Save Layout</a>
                        <div className="my-1 border-t border-gray-100"></div>
                        <div className="px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold">Permissions</div>
                        <a href="#" onClick={e => { e.preventDefault(); setPermissions(Permission.FULL); setIsMoreMenuOpen(false); }} className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <span>Full Access</span>
                            {permissions === Permission.FULL && <span className="text-blue-600">✔</span>}
                        </a>
                        <a href="#" onClick={e => { e.preventDefault(); setPermissions(Permission.PARTIAL); setIsMoreMenuOpen(false); }} className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <span>Partial Edit</span>
                            {permissions === Permission.PARTIAL && <span className="text-blue-600">✔</span>}
                        </a>
                        <a href="#" onClick={e => { e.preventDefault(); setPermissions(Permission.READONLY); setIsMoreMenuOpen(false); }} className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <span>Read-Only</span>
                            {permissions === Permission.READONLY && <span className="text-blue-600">✔</span>}
                        </a>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold capitalize">{modal}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
            </div>
            <div className="p-4 overflow-y-auto">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionsBar;