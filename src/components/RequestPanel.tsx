import React, { useState, useEffect } from 'react';
import { Environment, Request } from '../types';

interface RequestPanelProps {
  request: Request;
  environments: Environment[];
}

export const RequestPanel: React.FC<RequestPanelProps> = ({ request, environments }) => {
  const [activeTab, setActiveTab] = useState('params');
  const [method, setMethod] = useState(request.method);
  const [targetAUrl, setTargetAUrl] = useState('');
  const [targetBUrl, setTargetBUrl] = useState('');
  const [params, setParams] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: 'limit', value: '10', enabled: true },
    { key: 'offset', value: '0', enabled: true },
  ]);
  const [headers, setHeaders] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
  ]);
  const [body, setBody] = useState(
    JSON.stringify({ name: "New Item", status: "active" }, null, 2)
  );
  const [bodyType, setBodyType] = useState('JSON');
  const [authType, setAuthType] = useState('Bearer Token');
  const [token, setToken] = useState('{{token}}');

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
  const bodyTypes = ['None', 'Form Data', 'JSON', 'XML', 'Raw', 'Binary'];
  const authTypes = ['No Auth', 'Basic Auth', 'Bearer Token', 'OAuth 2.0', 'API Key'];

  // Initialize environment-specific URLs
  useEffect(() => {
    const targetA = environments.find(e => e.id === 'target_a');
    const targetB = environments.find(e => e.id === 'target_b');
    
    setTargetAUrl(targetA?.urls?.[request.id] || request.url);
    setTargetBUrl(targetB?.urls?.[request.id] || request.url);
  }, [request, environments]);

  return (
    <div className="p-4 border-b border-gray-300 overflow-y-auto">
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
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#4CAF50' }}></div>
          <span className="text-sm font-medium mr-2">Target A:</span>
          <input 
            type="text" 
            className="flex-1 border border-gray-300 px-3 py-2 rounded"
            value={targetAUrl}
            onChange={(e) => setTargetAUrl(e.target.value)}
            placeholder="Target A URL"
          />
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#2196F3' }}></div>
          <span className="text-sm font-medium mr-2">Target B:</span>
          <input 
            type="text" 
            className="flex-1 border border-gray-300 px-3 py-2 rounded"
            value={targetBUrl}
            onChange={(e) => setTargetBUrl(e.target.value)}
            placeholder="Target B URL"
          />
        </div>
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