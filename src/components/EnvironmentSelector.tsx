import React from 'react';
import { Send } from 'lucide-react';
import { Environment } from '../types';

interface EnvironmentSelectorProps {
  environments: Environment[];
  selectedEnvironments: string[];
  onToggle: (envId: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  selectedEnvironments,
  onToggle,
  onSend,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="font-medium">Test in:</span>
        {environments.map(env => (
          <label key={env.id} className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox"
              checked={selectedEnvironments.includes(env.id)}
              onChange={() => onToggle(env.id)}
              className="rounded"
            />
            <span 
              className="flex items-center"
              style={{ color: env.color }}
            >
              <span 
                className="w-2 h-2 rounded-full mr-1" 
                style={{ backgroundColor: env.color }}
              ></span>
              {env.name}
            </span>
          </label>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
          onClick={onSend}
          disabled={isLoading || selectedEnvironments.length === 0}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              Send
            </>
          )}
        </button>
        
        <button className="px-4 py-2 border border-gray-300 rounded">
          Save
        </button>
      </div>
    </div>
  );
};