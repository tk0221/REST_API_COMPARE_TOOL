import React, { useState, useEffect } from 'react';
import { Environment, Response, Difference } from '../types';

interface ResponsePanelProps {
  responses: Record<string, Response>;
  environments: Environment[];
  isLoading: boolean;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ 
  responses, 
  environments,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [responseViewTab, setResponseViewTab] = useState('body');
  
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      setActiveTab(Object.keys(responses)[0]);
    } else {
      setActiveTab(null);
    }
    setCompareMode(false);
  }, [responses]);
  
  useEffect(() => {
    if (compareMode && Object.keys(responses).length >= 2) {
      const envIds = Object.keys(responses);
      const diffs = findDifferences(
        JSON.parse(responses[envIds[0]].body),
        JSON.parse(responses[envIds[1]].body),
        ''
      );
      setDifferences(diffs);
    }
  }, [compareMode, responses]);
  
  const findDifferences = (obj1: any, obj2: any, path: string): Difference[] => {
    if (obj1 === obj2) return [];
    
    if (typeof obj1 !== typeof obj2) {
      return [{
        path: path || '/',
        type: 'changed',
        leftValue: obj1,
        rightValue: obj2
      }];
    }
    
    if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
      return [{
        path: path || '/',
        type: 'changed',
        leftValue: obj1,
        rightValue: obj2
      }];
    }
    
    const diffs: Difference[] = [];
    
    // Check for arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      const maxLength = Math.max(obj1.length, obj2.length);
      
      for (let i = 0; i < maxLength; i++) {
        const currentPath = `${path}[${i}]`;
        
        if (i >= obj1.length) {
          diffs.push({
            path: currentPath,
            type: 'added',
            rightValue: obj2[i]
          });
        } else if (i >= obj2.length) {
          diffs.push({
            path: currentPath,
            type: 'removed',
            leftValue: obj1[i]
          });
        } else {
          diffs.push(...findDifferences(obj1[i], obj2[i], currentPath));
        }
      }
      
      return diffs;
    }
    
    // Handle objects
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj1)) {
        diffs.push({
          path: currentPath,
          type: 'added',
          rightValue: obj2[key]
        });
      } else if (!(key in obj2)) {
        diffs.push({
          path: currentPath,
          type: 'removed',
          leftValue: obj1[key]
        });
      } else {
        diffs.push(...findDifferences(obj1[key], obj2[key], currentPath));
      }
    }
    
    return diffs;
  };
  
  const getEnvironmentById = (id: string) => {
    return environments.find(env => env.id === id);
  };
  
  const renderResponseBody = (body: string, envId: string) => {
    try {
      const json = JSON.parse(body);
      return (
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(json, null, 2)}
        </pre>
      );
    } catch (e) {
      return (
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {body}
        </pre>
      );
    }
  };

  const renderResponseHeaders = (headers: Record<string, string>) => {
    return (
      <div className="bg-gray-50 p-4 rounded overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Key</th>
              <th className="text-left p-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(headers).map(([key, value], index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="p-2 font-medium">{key}</td>
                <td className="p-2 font-mono">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderComparisonView = () => {
    const envIds = Object.keys(responses);
    if (envIds.length < 2) return null;
    
    const env1 = getEnvironmentById(envIds[0]);
    const env2 = getEnvironmentById(envIds[1]);
    
    if (!env1 || !env2) return null;
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <div>
              <span 
                className="inline-block w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: env1.color }}
              ></span>
              <span className="font-medium">{env1.name}</span>
            </div>
            <div>
              <span 
                className="inline-block w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: env2.color }}
              ></span>
              <span className="font-medium">{env2.name}</span>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="mr-4">
              <span className="inline-block w-3 h-3 bg-red-200 mr-1"></span>
              Removed: {differences.filter(d => d.type === 'removed').length}
            </span>
            <span className="mr-4">
              <span className="inline-block w-3 h-3 bg-green-200 mr-1"></span>
              Added: {differences.filter(d => d.type === 'added').length}
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-yellow-200 mr-1"></span>
              Changed: {differences.filter(d => d.type === 'changed').length}
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="overflow-auto">
              {renderResponseBody(responses[envIds[0]].body, envIds[0])}
            </div>
            <div className="overflow-auto">
              {renderResponseBody(responses[envIds[1]].body, envIds[1])}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-medium mb-2">Differences</h3>
          <div className="max-h-32 overflow-y-auto">
            {differences.length === 0 ? (
              <p className="text-green-600">No differences found!</p>
            ) : (
              <ul className="space-y-1">
                {differences.map((diff, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-mono">{diff.path}</span>: 
                    {diff.type === 'added' && (
                      <span className="text-green-600 ml-2">
                        Added <code className="bg-green-100 px-1">{JSON.stringify(diff.rightValue)}</code>
                      </span>
                    )}
                    {diff.type === 'removed' && (
                      <span className="text-red-600 ml-2">
                        Removed <code className="bg-red-100 px-1">{JSON.stringify(diff.leftValue)}</code>
                      </span>
                    )}
                    {diff.type === 'changed' && (
                      <span className="text-yellow-600 ml-2">
                        Changed from <code className="bg-yellow-100 px-1">{JSON.stringify(diff.leftValue)}</code> to <code className="bg-yellow-100 px-1">{JSON.stringify(diff.rightValue)}</code>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Sending requests to selected environments...</p>
        </div>
      </div>
    );
  }
  
  if (Object.keys(responses).length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Send a request to see responses</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          {Object.keys(responses).map(envId => {
            const env = getEnvironmentById(envId);
            if (!env) return null;
            
            return (
              <button
                key={envId}
                className={`px-4 py-2 mr-2 rounded-t ${
                  activeTab === envId && !compareMode ? 'bg-white border border-gray-300 border-b-0' : 'bg-gray-100'
                }`}
                onClick={() => {
                  setActiveTab(envId);
                  setCompareMode(false);
                }}
              >
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: env.color }}
                ></span>
                {env.name}
                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                  {responses[envId].status}
                </span>
              </button>
            );
          })}
          
          {Object.keys(responses).length >= 2 && (
            <button
              className={`px-4 py-2 rounded-t ${
                compareMode ? 'bg-white border border-gray-300 border-b-0' : 'bg-gray-100'
              }`}
              onClick={() => setCompareMode(true)}
            >
              Compare
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-gray-300 rounded overflow-hidden">
        {compareMode ? (
          renderComparisonView()
        ) : activeTab && responses[activeTab] ? (
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 ${
                  responses[activeTab].status >= 200 && responses[activeTab].status < 300
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {responses[activeTab].status}
                </span>
              </div>
              <div>
                <span className="font-medium">Time:</span> 
                <span className="ml-2">{responses[activeTab].time} ms</span>
              </div>
              <div>
                <span className="font-medium">Size:</span> 
                <span className="ml-2">{responses[activeTab].size} bytes</span>
              </div>
            </div>
            
            <div className="flex border-b border-gray-300 mb-4">
              <button 
                className={`px-4 py-2 ${responseViewTab === 'body' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setResponseViewTab('body')}
              >
                Body
              </button>
              <button 
                className={`px-4 py-2 ${responseViewTab === 'headers' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setResponseViewTab('headers')}
              >
                Headers
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              {responseViewTab === 'body' && renderResponseBody(responses[activeTab].body, activeTab)}
              {responseViewTab === 'headers' && renderResponseHeaders(responses[activeTab].headers)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};