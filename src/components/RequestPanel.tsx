import React, { useState, useEffect } from 'react';
import { Environment, Request } from '../types';

interface RequestPanelProps {
  request: Request;
  environments: Environment[];
  targetUrls: Record<string, string>;
  useProxy: Record<string, boolean>;
  onUpdateRequest: (
    method: string,
    params: Array<{ key: string; value: string; enabled: boolean }>,
    headers: Array<{ key: string; value: string; enabled: boolean }>,
    body: string,
    targetUrls: Record<string, string>,
    useProxy: Record<string, boolean>
  ) => void;
}

export const RequestPanel: React.FC<RequestPanelProps> = ({ 
  request, 
  environments,
  targetUrls,
  useProxy,
  onUpdateRequest
}) => {
  const [activeTab, setActiveTab] = useState('params');
  const [method, setMethod] = useState(request.method || 'POST');
  const [params, setParams] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: 'limit', value: '10', enabled: true },
    { key: 'offset', value: '0', enabled: true },
  ]);
  const [headers, setHeaders] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
  ]);
  const [body, setBody] = useState(
    JSON.stringify({
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com"
    }, null, 2)
  );
  const [bodyType, setBodyType] = useState('JSON');
  const [authType, setAuthType] = useState('Bearer Token');
  const [token, setToken] = useState('{{token}}');
  const [localTargetUrls, setLocalTargetUrls] = useState<Record<string, string>>(targetUrls);
  const [localUseProxy, setLocalUseProxy] = useState<Record<string, boolean>>(useProxy);

  const methods = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
  const bodyTypes = ['None', 'Form Data', 'JSON', 'XML', 'Raw', 'Binary'];
  const authTypes = ['No Auth', 'Basic Auth', 'Bearer Token', 'OAuth 2.0', 'API Key'];

  // Initialize method and URLs when request changes
  useEffect(() => {
    setMethod(request.method || 'POST');
    setLocalTargetUrls(targetUrls);
    setLocalUseProxy(useProxy);
  }, [request, targetUrls, useProxy]);

  // Update parent component with request details
  useEffect(() => {
    onUpdateRequest(method, params, headers, body, localTargetUrls, localUseProxy);
  }, [method, params, headers, body, localTargetUrls, localUseProxy, onUpdateRequest]);

  // Handle URL changes for a specific environment
  const handleUrlChange = (envId: string, url: string) => {
    setLocalTargetUrls(prev => ({
      ...prev,
      [envId]: url
    }));
  };

  // Handle proxy toggle for a specific environment
  const handleProxyToggle = (envId: string) => {
    setLocalUseProxy(prev => ({
      ...prev,
      [envId]: !prev[envId]
    }));
  };

  return (
    <div className="p-4 border-b border-gray-300 overflow-y-auto max-h-[40vh]">
      <div className="flex items-center mb-4">
        <select 
          className="bg-gray-100 border border-gray-300 rounded px-3 py-2"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {methods.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        {environments.map(env => (
          <div key={env.id} className="flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: env.color }}></div>
              <span className="text-sm font-medium mr-2">{env.name}:</span>
            </div>
            <div className="flex items-center">
              <input 
                type="text" 
                className="flex-1 border border-gray-300 px-3 py-2 rounded-l"
                value={localTargetUrls[env.id] || ''}
                onChange={(e) => handleUrlChange(env.id, e.target.value)}
                placeholder={`${env.name} URL`}
              />
              <div className="bg-gray-100 border border-gray-300 border-l-0 rounded-r px-3 py-2 flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={localUseProxy[env.id] || false}
                    onChange={() => handleProxyToggle(env.id)}
                  />
                  <span className="text-sm">Use CORS Proxy</span>
                </label>
              </div>
            </div>
            {localUseProxy[env.id] && (
              <div className="mt-1 text-xs text-gray-500">
                Using proxy: https://corsproxy.io/?{encodeURIComponent(localTargetUrls[env.id] || '')}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-300">
          <button 
            className={`px-4 py-2 ${activeTab === 'params' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('params')}
          >
            Params
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'headers' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'auth' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            Auth
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'body' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            Body
          </button>
        </div>
        
        <div className="mt-4">
          {activeTab === 'params' && (
            <div className="space-y-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-10 p-2 text-left"></th>
                    <th className="p-2 text-left">Key</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="w-10 p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((param, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">
                        <input 
                          type="checkbox" 
                          checked={param.enabled}
                          onChange={() => {
                            const newParams = [...params];
                            newParams[index].enabled = !newParams[index].enabled;
                            setParams(newParams);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 px-2 py-1 rounded"
                          value={param.key}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[index].key = e.target.value;
                            setParams(newParams);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 px-2 py-1 rounded"
                          value={param.value}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[index].value = e.target.value;
                            setParams(newParams);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <button 
                          className="text-red-500"
                          onClick={() => {
                            setParams(params.filter((_, i) => i !== index));
                          }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                className="text-blue-500 text-sm"
                onClick={() => setParams([...params, { key: '', value: '', enabled: true }])}
              >
                + Add Parameter
              </button>
            </div>
          )}
          
          {activeTab === 'headers' && (
            <div className="space-y-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-10 p-2 text-left"></th>
                    <th className="p-2 text-left">Key</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="w-10 p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map((header, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">
                        <input 
                          type="checkbox" 
                          checked={header.enabled}
                          onChange={() => {
                            const newHeaders = [...headers];
                            newHeaders[index].enabled = !newHeaders[index].enabled;
                            setHeaders(newHeaders);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 px-2 py-1 rounded"
                          value={header.key}
                          onChange={(e) => {
                            const newHeaders = [...headers];
                            newHeaders[index].key = e.target.value;
                            setHeaders(newHeaders);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 px-2 py-1 rounded"
                          value={header.value}
                          onChange={(e) => {
                            const newHeaders = [...headers];
                            newHeaders[index].value = e.target.value;
                            setHeaders(newHeaders);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <button 
                          className="text-red-500"
                          onClick={() => {
                            setHeaders(headers.filter((_, i) => i !== index));
                          }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                className="text-blue-500 text-sm"
                onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
              >
                + Add Header
              </button>
            </div>
          )}
          
          {activeTab === 'auth' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Authentication Type</label>
                <select 
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                >
                  {authTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {authType === 'Basic Auth' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input 
                      type="password" 
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                      placeholder="Enter password"
                    />
                  </div>
                </>
              )}

              {authType === 'Bearer Token' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Token</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 px-3 py-2 rounded font-mono text-sm"
                    placeholder="Enter token or use {{token}} variable"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can use environment variables like {'{{'} token {'}}'}  which will be replaced with the corresponding value from each environment.
                  </p>
                </div>
              )}

              {authType === 'API Key' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Key</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                      placeholder="API Key Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                      placeholder="API Key Value or {{apiKey}}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Add to</label>
                    <select className="w-full border border-gray-300 px-3 py-2 rounded">
                      <option value="header">Header</option>
                      <option value="query">Query Parameter</option>
                    </select>
                  </div>
                </>
              )}

              {authType === 'OAuth 2.0' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Grant Type</label>
                    <select className="w-full border border-gray-300 px-3 py-2 rounded">
                      <option value="authorization_code">Authorization Code</option>
                      <option value="client_credentials">Client Credentials</option>
                      <option value="password">Password</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Access Token</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                      placeholder="Enter token or use {{oauth_token}}"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'body' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Body Type</label>
                <select 
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                >
                  {bodyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <textarea 
                  className="w-full h-64 border border-gray-300 px-3 py-2 rounded font-mono text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};