import React, { useState } from 'react';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';
import { useDesignState } from '../../context/DesignContext';
import { Permission } from '../../types';
import { XIcon } from '../icons';

type Tab = 'properties' | 'layers';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const { permissions } = useDesignState();

  const isVisible = permissions === Permission.FULL;
  if (!isVisible) {
      // On desktop, render nothing. On mobile, the component logic will handle visibility.
      return <div className="hidden md:hidden"></div>;
  }


  const tabButtonClasses = (tab: Tab) => `
    flex-1 py-2 px-4 text-sm font-medium text-center transition-colors
    ${activeTab === tab ? 'bg-white text-gray-800' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
  `;

  const panelContainerClasses = `
    fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out flex flex-col
    md:relative md:w-72 md:h-full md:shadow-lg md:transform-none md:flex
    ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0
    ${!isVisible ? 'hidden' : ''}
  `;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} />}
      <div className={panelContainerClasses}>
        <div className="flex border-b border-gray-200 items-center">
            <button className={tabButtonClasses('properties')} onClick={() => setActiveTab('properties')}>
            Properties
            </button>
            <button className={tabButtonClasses('layers')} onClick={() => setActiveTab('layers')}>
            Layers
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-gray-800 md:hidden">
              <XIcon />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {activeTab === 'properties' ? <PropertiesPanel /> : <LayersPanel />}
        </div>
      </div>
    </>
  );
};

export default SidePanel;