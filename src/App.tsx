import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { Collection, Environment, Request, Response } from './types';

function App() {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'User API',
      requests: [
        { id: '1-1', name: 'Get Users', method: 'GET', url: 'https://api.{{env}}.example.com/users' },
        { id: '1-2', name: 'Get User by ID', method: 'GET', url: 'https://api.{{env}}.example.com/users/{{userId}}' },
        { id: '1-3', name: 'Create User', method: 'POST', url: 'https://api.{{env}}.example.com/users' }
      ]
    },
    {
      id: '2',
      name: 'Product API',
      requests: [
        { id: '2-1', name: 'Get Products', method: 'GET', url: 'https://api.{{env}}.example.com/products' },
        { id: '2-2', name: 'Get Product by ID', method: 'GET', url: 'https://api.{{env}}.example.com/products/{{productId}}' }
      ]
    }
  ]);

  const [environments, setEnvironments] = useState<Environment[]>([
    { 
      id: 'target_a', 
      name: 'Target A', 
      color: '#4CAF50', 
      variables: { env: 'dev', userId: '123', productId: '456' },
      baseUrl: 'https://api.dev.example.com',
      token: 'dev-token-12345',
      urls: {
        '1-1': 'https://target-a-api.example.com/users',
        '1-2': 'https://target-a-api.example.com/users/{{userId}}',
        '2-1': 'https://target-a-api.example.com/products'
      }
    },
    { 
      id: 'target_b', 
      name: 'Target B', 
      color: '#2196F3', 
      variables: { env: 'qa', userId: '123', productId: '456' },
      baseUrl: 'https://api.qa.example.com',
      token: 'qa-token-67890',
      urls: {
        '1-1': 'https://target-b-api.example.com/users',
        '1-2': 'https://target-b-api.example.com/users/{{userId}}',
        '2-1': 'https://target-b-api.example.com/products'
      }
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(['target_a', 'target_b']);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRequestSelect = (request: Request) => {
    setSelectedRequest(request);
    setResponses({});
  };

  const handleEnvironmentToggle = (envId: string) => {
    setSelectedEnvironments(prev => 
      prev.includes(envId) 
        ? prev.filter(id => id !== envId) 
        : [...prev, envId]
    );
  };

  const handleSendRequest = async () => {
    if (!selectedRequest) return;
    
    setIsLoading(true);
    const newResponses: Record<string, Response> = {};
    
    // Simulate API calls to different environments
    for (const envId of selectedEnvironments) {
      const env = environments.find(e => e.id === envId);
      if (!env) continue;
      
      // Get environment-specific URL if available, otherwise use the default URL
      let url = env.urls && env.urls[selectedRequest.id] 
        ? env.urls[selectedRequest.id] 
        : selectedRequest.url;
      
      // Replace variables in URL
      Object.entries(env.variables).forEach(([key, value]) => {
        url = url.replace(`{{${key}}}`, value.toString());
      });
      
      // Add token to headers if using Bearer Token auth
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (env.token) {
        headers['Authorization'] = `Bearer ${env.token}`;
      }
      
      // Simulate different responses based on environment
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      if (envId === 'target_a') {
        newResponses[envId] = {
          status: 200,
          time: 235,
          size: 1024,
          headers: headers,
          body: JSON.stringify({
            data: [
              { id: 1, name: 'Item 1', status: 'active' },
              { id: 2, name: 'Item 2', status: 'pending' }
            ],
            meta: { total: 2, version: '1.0.0-dev' }
          }, null, 2)
        };
      } else if (envId === 'target_b') {
        newResponses[envId] = {
          status: 200,
          time: 198,
          size: 1048,
          headers: headers,
          body: JSON.stringify({
            data: [
              { id: 1, name: 'Item 1', status: 'active' },
              { id: 2, name: 'Item 2', status: 'active' }, // Different status
              { id: 3, name: 'Item 3', status: 'inactive' } // Extra item
            ],
            meta: { total: 3, version: '1.0.0-qa' }
          }, null, 2)
        };
      }
    }
    
    setResponses(newResponses);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">API Environment Comparison Tool</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          collections={collections} 
          environments={environments}
          onRequestSelect={handleRequestSelect}
          selectedRequestId={selectedRequest?.id}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedRequest ? (
            <>
              <RequestPanel 
                request={selectedRequest} 
                environments={environments}
              />
              
              <div className="border-t border-gray-300 p-4 bg-gray-50">
                <EnvironmentSelector 
                  environments={environments}
                  selectedEnvironments={selectedEnvironments}
                  onToggle={handleEnvironmentToggle}
                  onSend={handleSendRequest}
                  isLoading={isLoading}
                />
              </div>
              
              <ResponsePanel 
                responses={responses}
                environments={environments}
                isLoading={isLoading}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a request from the sidebar to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;