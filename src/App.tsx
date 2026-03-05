import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ConceptDoc from './components/ConceptDoc';
import PrototypeUI from './components/PrototypeUI';
import { documentationData } from './data/documentationData';
import { FileText, LayoutTemplate } from 'lucide-react';

export default function App() {
  const [activeDocSection, setActiveDocSection] = useState(documentationData[0].id);
  const [viewMode, setViewMode] = useState<'doc' | 'prototype'>('doc');

  const currentSection = documentationData.find(s => s.id === activeDocSection) || documentationData[0];

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar - Only visible in Doc mode */}
      {viewMode === 'doc' && (
        <Sidebar 
          sections={documentationData} 
          activeSection={activeDocSection} 
          setActiveSection={setActiveDocSection} 
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* View Toggle Header */}
        <div className="absolute top-4 right-6 z-50 flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('doc')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              viewMode === 'doc' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Документация
          </button>
          <button
            onClick={() => setViewMode('prototype')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              viewMode === 'prototype' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" /> Прототип UI
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto w-full h-full">
          {viewMode === 'prototype' ? (
            <PrototypeUI />
          ) : (
            <ConceptDoc section={currentSection} />
          )}
        </div>
      </div>
    </div>
  );
}
