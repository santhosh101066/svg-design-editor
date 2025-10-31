import React from 'react';
import { useDesignState } from '../../context/DesignContext';
import { ToolsList, ToolIcons } from '../../constants';
import { Permission } from '../../types';

const Toolbar: React.FC = () => {
  const { currentTool, setCurrentTool, permissions } = useDesignState();

  if (permissions !== Permission.FULL) {
    return null;
  }

  return (
    <div className="w-full h-16 bg-white shadow-lg p-2 flex-shrink-0 order-last md:order-first md:w-20 md:h-full md:p-3 z-10">
      <div className="flex flex-row justify-center items-center h-full md:flex-col space-x-2 md:space-x-0 md:space-y-2">
        {ToolsList.map(({ name, type }) => (
          <button
            key={type}
            title={name}
            onClick={() => setCurrentTool(type)}
            className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-150 transform hover:scale-105
              ${currentTool === type ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {ToolIcons[type]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;