import React from 'react';
import { Section } from '../data/documentationData';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
  sections: Section[];
  activeSection: string;
  setActiveSection: (id: string) => void;
}

export default function Sidebar({ sections, activeSection, setActiveSection }: SidebarProps) {
  return (
    <div className="w-80 h-full bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 overflow-y-auto flex-shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-500 mb-1">TrueDom</h1>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">PropTech Concept</p>
        
        <nav className="space-y-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-between group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="font-medium truncate pr-2">{section.title}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
