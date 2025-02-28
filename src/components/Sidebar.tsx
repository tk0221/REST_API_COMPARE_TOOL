import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, FileText, Settings } from 'lucide-react';
import { Collection, Environment, Request } from '../types';

interface SidebarProps {
  collections: Collection[];
  environments: Environment[];
  onRequestSelect: (request: Request) => void;
  selectedRequestId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collections, 
  environments, 
  onRequestSelect,
  selectedRequestId
}) => {
  const [expandedCollections, setExpandedCollections] = useState<string[]>(
    collections.map(c => c.id)
  );

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-300 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Collections</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <Settings size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {collections.map(collection => (
          <div key={collection.id} className="border-b border-gray-200">
            <div 
              className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => toggleCollection(collection.id)}
            >
              {expandedCollections.includes(collection.id) ? (
                <ChevronDown size={16} className="mr-1" />
              ) : (
                <ChevronRight size={16} className="mr-1" />
              )}
              <FolderOpen size={16} className="mr-2 text-yellow-500" />
              <span>{collection.name}</span>
            </div>
            
            {expandedCollections.includes(collection.id) && (
              <div className="pl-6">
                {collection.requests.map(request => (
                  <div 
                    key={request.id}
                    className={`flex items-center p-2 hover:bg-gray-200 cursor-pointer ${
                      selectedRequestId === request.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => onRequestSelect(request)}
                  >
                    <FileText size={16} className="mr-2 text-blue-500" />
                    <span className="text-sm">{request.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-300">
        <h2 className="font-semibold mb-2">Environments</h2>
        <div className="space-y-2">
          {environments.map(env => (
            <div key={env.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: env.color }}
              ></div>
              <span className="text-sm">{env.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};