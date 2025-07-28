import React, { useState, useEffect, useCallback } from 'react';
import { Download, Upload, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import './App.css';

const ClaudeConfigManager = () => {
  const [config, setConfig] = useState({
    mcpServers: {}
  });
  const [showPassword, setShowPassword] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('visual');

  const validateConfig = useCallback(() => {
    const errors = [];
    
    Object.entries(config.mcpServers).forEach(([serverName, serverConfig]) => {
      if (!serverName.trim()) {
        errors.push('Server name cannot be empty');
      }
      
      if (!serverConfig.command) {
        errors.push(`Server "${serverName}": Command is required`);
      }
      
      if (serverConfig.args && !Array.isArray(serverConfig.args)) {
        errors.push(`Server "${serverName}": Args must be an array`);
      }
      
      if (serverConfig.env && typeof serverConfig.env !== 'object') {
        errors.push(`Server "${serverName}": Environment variables must be an object`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [config.mcpServers]);

  // Initialize with empty config
  useEffect(() => {
    validateConfig();
  }, [validateConfig]);

  const addMcpServer = () => {
    const newServerName = `new-server-${Object.keys(config.mcpServers).length + 1}`;
    setConfig(prev => ({
      ...prev,
      mcpServers: {
        ...prev.mcpServers,
        [newServerName]: {
          command: '',
          args: [],
          env: {}
        }
      }
    }));
  };

  const updateServerName = (oldName, newName) => {
    if (oldName === newName) return;
    
    setConfig(prev => {
      const newServers = { ...prev.mcpServers };
      newServers[newName] = newServers[oldName];
      delete newServers[oldName];
      return { ...prev, mcpServers: newServers };
    });
  };

  const updateServer = (serverName, field, value) => {
    setConfig(prev => ({
      ...prev,
      mcpServers: {
        ...prev.mcpServers,
        [serverName]: {
          ...prev.mcpServers[serverName],
          [field]: value
        }
      }
    }));
  };

  const removeServer = (serverName) => {
    setConfig(prev => {
      const newServers = { ...prev.mcpServers };
      delete newServers[serverName];
      return { ...prev, mcpServers: newServers };
    });
  };

  const addArg = (serverName) => {
    const currentArgs = config.mcpServers[serverName].args || [];
    updateServer(serverName, 'args', [...currentArgs, '']);
  };

  const updateArg = (serverName, index, value) => {
    const currentArgs = [...(config.mcpServers[serverName].args || [])];
    currentArgs[index] = value;
    updateServer(serverName, 'args', currentArgs);
  };

  const removeArg = (serverName, index) => {
    const currentArgs = config.mcpServers[serverName].args || [];
    const newArgs = currentArgs.filter((_, i) => i !== index);
    updateServer(serverName, 'args', newArgs);
  };

  const addEnvVar = (serverName) => {
    const currentEnv = config.mcpServers[serverName].env || {};
    updateServer(serverName, 'env', { ...currentEnv, 'NEW_VAR': '' });
  };

  const updateEnvVar = (serverName, oldKey, newKey, value) => {
    const currentEnv = { ...config.mcpServers[serverName].env };
    if (oldKey !== newKey) {
      delete currentEnv[oldKey];
    }
    currentEnv[newKey] = value;
    updateServer(serverName, 'env', currentEnv);
  };

  const removeEnvVar = (serverName, key) => {
    const currentEnv = { ...config.mcpServers[serverName].env };
    delete currentEnv[key];
    updateServer(serverName, 'env', currentEnv);
  };

  const exportConfig = () => {
    if (!validateConfig()) {
      alert('Please fix validation errors before exporting');
      return;
    }
    
    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claude_desktop_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccessMessage('Configuration exported successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const importConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target.result);
        setConfig(importedConfig);
        setSuccessMessage('Configuration imported successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        alert('Invalid JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    if (!validateConfig()) {
      alert('Please fix validation errors before copying');
      return;
    }
    
    const configJson = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configJson).then(() => {
      setSuccessMessage('Configuration copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    });
  };

  const togglePasswordVisibility = (serverName, envKey) => {
    const key = `${serverName}-${envKey}`;
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadCommonConfigs = (type) => {
    const configs = {
      github: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          "GITHUB_PERSONAL_ACCESS_TOKEN": ""
        }
      },
      filesystem: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"],
        env: {}
      },
      brave: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-brave-search"],
        env: {
          "BRAVE_API_KEY": ""
        }
      },
      postgres: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-postgres"],
        env: {
          "POSTGRES_CONNECTION_STRING": ""
        }
      }
    };
    
    if (configs[type]) {
      const serverName = type;
      setConfig(prev => ({
        ...prev,
        mcpServers: {
          ...prev.mcpServers,
          [serverName]: configs[type]
        }
      }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claude MCP Configuration Manager</h1>
        <p className="text-gray-600">Create and manage your Claude desktop configuration file with proper formatting and validation.</p>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">Validation Errors:</span>
          </div>
          <ul className="list-disc list-inside text-red-600 text-sm">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={addMcpServer}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add MCP Server
        </button>
        
        <label className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Import Config
          <input type="file" accept=".json" onChange={importConfig} className="hidden" />
        </label>
        
        <button
          onClick={exportConfig}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Config
        </button>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </button>
      </div>

      {/* Quick Add Common Configs */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Add Common MCP Servers:</h3>
        <div className="flex flex-wrap gap-2">
          {['github', 'filesystem', 'brave', 'postgres'].map(type => (
            <button
              key={type}
              onClick={() => loadCommonConfigs(type)}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors capitalize"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('visual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visual Editor
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'json'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              JSON Preview
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'visual' ? (
        <div className="space-y-6">
          {Object.entries(config.mcpServers).map(([serverName, serverConfig]) => (
            <div key={serverName} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Server Name</label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => updateServerName(serverName, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => removeServer(serverName)}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Command */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Command</label>
                <input
                  type="text"
                  value={serverConfig.command || ''}
                  onChange={(e) => updateServer(serverName, 'command', e.target.value)}
                  placeholder="e.g., npx, python, node"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Arguments */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Arguments</label>
                  <button
                    onClick={() => addArg(serverName)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Argument
                  </button>
                </div>
                {(serverConfig.args || []).map((arg, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={arg}
                      onChange={(e) => updateArg(serverName, index, e.target.value)}
                      placeholder="Argument value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    />
                    <button
                      onClick={() => removeArg(serverName, index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Environment Variables */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Environment Variables</label>
                  <button
                    onClick={() => addEnvVar(serverName)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Variable
                  </button>
                </div>
                {Object.entries(serverConfig.env || {}).map(([key, value]) => (
                  <div key={key} className="flex mb-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updateEnvVar(serverName, key, e.target.value, value)}
                      placeholder="Variable name"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    />
                    <div className="flex-1 relative mr-2">
                      <input
                        type={showPassword[`${serverName}-${key}`] ? "text" : "password"}
                        value={value}
                        onChange={(e) => updateEnvVar(serverName, key, key, e.target.value)}
                        placeholder="Variable value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(serverName, key)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword[`${serverName}-${key}`] ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => removeEnvVar(serverName, key)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(config.mcpServers).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No MCP servers configured. Click "Add MCP Server" to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ClaudeConfigManager;