import React, { useState } from 'react';
import ActionsBar from './ActionsBar';
import Toolbar from './Toolbar';
import Playground from './Playground';
import SidePanel from './SidePanel';

const Editor: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100 antialiased text-gray-900 font-sans overflow-hidden">
      <ActionsBar toggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)} />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Toolbar />
        <Playground />
        <SidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} />
      </div>
    </div>
  );
};

export default Editor;