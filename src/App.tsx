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
        { id: '1-1', name: 'Get Users', method: 'POST', url: 'https://api.{{env}}.example.com/users' },
        { id: '1-2', name: 'Get User by ID', method: 'POST', url: 'https://api.{{env}}.example.com/users/{{userId}}' },
        { id: '1-3', name: 'Create User', method: 'POST', url: 'https://api.{{env}}.example.com/users' }
      ]
    },
    {
      id: '2',
      name: 'Product API',
      requests: [
        { id: '2-1', name: 'Get Products', method: 'POST', url: 'https://api.{{env}}.example.com/products' },
        { id: '2-2', name: 'Get Product by ID', method: 'POST', url: 'https://api.{{env}}.example.com/products/{{productId}}' }
      ]
    }
  ]);

  const [environments, setEnvironments] = useState<Environment[]>([
    { 
      id: 'target_a', 
      name: 'Target A', 
      color: '#4CAF50', 
      variables: { env: 'dev', userId: '1', productId: '1' },
      baseUrl: 'https://google.com',
      token: 'dev-token-12345',
      urls: {
        '1-1': 'https://dummyjson.com/users',
        '1-2': 'https://dummyjson.com/users/{{userId}}',
        '1-3': 'https://dummyjson.com/users/add',
        '2-1': 'https://dummyjson.com/products',
        '2-2': 'https://dummyjson.com/products/{{productId}}'
      }
    },
    { 
      id: 'target_b', 
      name: 'Target B', 
      color: '#2196F3', 
      variables: { env: 'qa', userId: '1', productId: '1' },
      baseUrl: 'https://dummyjson.com',
      token: 'qa-token-67890',
      urls: {
        '1-1': 'https://dummyjson.com/users',
        '1-2': 'https://dummyjson.com/users/{{userId}}',
        '1-3': 'https://dummyjson.com/users/add',
        '2-1': 'https://dummyjson.com/products',
        '2-2': 'https://dummyjson.com/products/{{productId}}'
      }
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(['target_a', 'target_b']);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requestParams, setRequestParams] = useState<Array<{ key: string; value: string; enabled: boolean }>>([]);
  const [requestHeaders, setRequestHeaders] = useState<Array<{ key: string; value: string; enabled: boolean }>>([]);
  const [requestBody, setRequestBody] = useState<string>('');
  const [requestMethod, setRequestMethod] = useState<string>('POST');
  const [targetUrls, setTargetUrls] = useState<Record<string, string>>({});
  const [useProxy, setUseProxy] = useState<Record<string, boolean>>({
    target_a: true,
    target_b: true
  });

  const handleRequestSelect = (request: Request) => {
    setSelectedRequest(request);
    setResponses({});
    setRequestMethod(request.method || 'POST');
    
    // Initialize target URLs when a request is selected
    const urls: Record<string, string> = {};
    environments.forEach(env => {
      if (env.urls && env.urls[request.id]) {
        urls[env.id] = env.urls[request.id];
      } else {
        urls[env.id] = request.url;
      }
    });
    setTargetUrls(urls);
  };

  const handleEnvironmentToggle = (envId: string) => {
    setSelectedEnvironments(prev => 
      prev.includes(envId) 
        ? prev.filter(id => id !== envId) 
        : [...prev, envId]
    );
  };

  const updateRequestDetails = (
    method: string,
    params: Array<{ key: string; value: string; enabled: boolean }>,
    headers: Array<{ key: string; value: string; enabled: boolean }>,
    body: string,
    updatedUrls: Record<string, string>,
    updatedUseProxy: Record<string, boolean>
  ) => {
    setRequestMethod(method);
    setRequestParams(params);
    setRequestHeaders(headers);
    setRequestBody(body);
    setTargetUrls(updatedUrls);
    setUseProxy(updatedUseProxy);
  };

  const handleSendRequest = async () => {
    if (!selectedRequest) return;
    
    setIsLoading(true);
    setResponses({});
    const newResponses: Record<string, Response> = {};
    
    // Make actual API calls to different environments
    for (const envId of selectedEnvironments) {
      const env = environments.find(e => e.id === envId);
      if (!env) continue;
      
      // Get the URL for this environment from the targetUrls state
      let url = targetUrls[envId] || '';
      if (!url) {
        console.error(`No URL found for environment ${envId}`);
        continue;
      }
      
      // Replace variables in URL
      Object.entries(env.variables).forEach(([key, value]) => {
        url = url.replace(`{{${key}}}`, value.toString());
      });
      
      // Add query parameters
      if (requestParams.length > 0) {
        const enabledParams = requestParams.filter(p => p.enabled);
        if (enabledParams.length > 0) {
          const queryString = enabledParams
            .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join('&');
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      }
      
      // Prepare headers
      const headers: Record<string, string> = {};
      
      // Add custom headers
      requestHeaders.forEach(header => {
        if (header.enabled && header.key) {
          headers[header.key] = header.value;
        }
      });
      
      // Add content type if not already set
      if (!headers['Content-Type'] && requestMethod !== 'GET' && requestMethod !== 'HEAD') {
        headers['Content-Type'] = 'application/json';
      }
      
      // Add token to headers if using Bearer Token auth
      if (env.token) {
        headers['Authorization'] = `Bearer ${env.token}`;
      }
      
      try {
        console.log(`Sending ${requestMethod} request to: ${url}`);
        console.log('Headers:', headers);
        console.log('Using proxy:', useProxy[envId]);
        
        const startTime = performance.now();
        
        let response;
        let responseData;
        
        // Use a CORS proxy if enabled for this environment
        if (useProxy[envId]) {
          // Use a CORS proxy service
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
          
          // Prepare request options
          const requestOptions: RequestInit = {
            method: requestMethod,
            headers: headers,
            mode: 'cors',
            cache: 'no-cache',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
          };
          
          // Add body for non-GET requests
          if (requestMethod !== 'GET' && requestMethod !== 'HEAD') {
            requestOptions.body = requestBody || JSON.stringify({
              name: "John Doe",
              username: "johndoe",
              email: "john@example.com"
            });
          }
          
          // Make the actual API request through the proxy
          response = await fetch(proxyUrl, requestOptions);
          responseData = await response.text();
        } else {
          // Direct request without proxy (will likely fail for cross-origin requests)
          const requestOptions: RequestInit = {
            method: requestMethod,
            headers: headers,
            mode: 'cors',
            cache: 'no-cache',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
          };
          
          // Add body for non-GET requests
          if (requestMethod !== 'GET' && requestMethod !== 'HEAD') {
            requestOptions.body = requestBody || JSON.stringify({
              name: "John Doe",
              username: "johndoe",
              email: "john@example.com"
            });
          }
          
          response = await fetch(url, requestOptions);
          responseData = await response.text();
        }
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        let formattedBody = responseData;
        
        // Try to format as JSON if possible
        try {
          const jsonData = JSON.parse(responseData);
          formattedBody = JSON.stringify(jsonData, null, 2);
        } catch (e) {
          // Not JSON, keep as text
        }
        
        // Get response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        
        newResponses[envId] = {
          status: response.status,
          time: responseTime,
          size: new Blob([responseData]).size,
          headers: responseHeaders,
          body: formattedBody,
          url: url
        };
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        newResponses[envId] = {
          status: 0,
          time: 0,
          size: 0,
          headers: { 'error': 'true' },
          body: JSON.stringify({ 
            error: 'Failed to fetch', 
            message: error instanceof Error ? error.message : 'Unknown error',
            url: url
          }, null, 2),
          url: url
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
                onUpdateRequest={updateRequestDetails}
                targetUrls={targetUrls}
                useProxy={useProxy}
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