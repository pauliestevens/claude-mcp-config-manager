import React, { useState, useEffect, useCallback } from 'react';
import { Download, Upload, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, Copy, Shield, Lock, AlertTriangle } from 'lucide-react';
import './App.css';

const SecurityNotice = () => (
  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-center mb-2">
      <Shield className="h-5 w-5 text-yellow-600 mr-2" />
      <span className="font-medium text-yellow-800">Security Notice</span>
    </div>
    <ul className="text-sm text-yellow-700 space-y-1">
      <li>• All data processing happens locally in your browser - nothing is sent to external servers</li>
      <li>• Close browser developer tools when entering API keys to prevent accidental exposure</li>
      <li>• Exported files contain plaintext secrets - store them securely and limit access</li>
      <li>• Use environment-specific keys (avoid production keys for testing)</li>
      <li>• Regularly rotate API keys per service security recommendations</li>
    </ul>
  </div>
);

const ClaudeConfigManager = () => {
  const [config, setConfig] = useState({
    mcpServers: {}
  });
  const [showPassword, setShowPassword] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('visual');
  const [exportOptions, setExportOptions] = useState({
    includeSecrets: true,
    showWarning: false
  });
  const [devToolsWarning, setDevToolsWarning] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Check for developer tools (basic detection)
  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        setDevToolsWarning(true);
      } else {
        setDevToolsWarning(false);
      }
    };

    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    return () => window.removeEventListener('resize', checkDevTools);
  }, []);

  // Session timeout for sensitive data warning
  useEffect(() => {
    const hasSecrets = Object.values(config.mcpServers).some(server => 
      Object.keys(server.env || {}).length > 0
    );

    if (hasSecrets && !sessionTimeout) {
      const timeout = setTimeout(() => {
        setSessionTimeout('Consider clearing sensitive data if you\'re finished configuring.');
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearTimeout(timeout);
    }
  }, [config.mcpServers, sessionTimeout]);

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

  const createExportConfig = () => {
    if (!exportOptions.includeSecrets) {
      // Create config with placeholder values for environment variables
      const sanitizedConfig = {
        mcpServers: {}
      };
      
      Object.entries(config.mcpServers).forEach(([serverName, serverConfig]) => {
        sanitizedConfig.mcpServers[serverName] = {
          ...serverConfig,
          env: {}
        };
        
        // Add placeholder entries for env vars
        Object.keys(serverConfig.env || {}).forEach(key => {
          sanitizedConfig.mcpServers[serverName].env[key] = `[ENTER_${key.toUpperCase()}_HERE]`;
        });
      });
      
      return sanitizedConfig;
    }
    
    return config;
  };

  const exportConfig = () => {
    if (!validateConfig()) {
      alert('Please fix validation errors before exporting');
      return;
    }

    // Check if config contains secrets
    const hasSecrets = Object.values(config.mcpServers).some(server => 
      Object.values(server.env || {}).some(value => value.trim() !== '')
    );

    if (hasSecrets && exportOptions.includeSecrets) {
      setExportOptions(prev => ({ ...prev, showWarning: true }));
      return;
    }

    performExport();
  };

  const performExport = () => {
    const exportConfig = createExportConfig();
    const configJson = JSON.stringify(exportConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claude_desktop_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const message = exportOptions.includeSecrets 
      ? 'Configuration exported with API keys - store securely!'
      : 'Configuration exported with placeholder values for API keys';
      
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
    setExportOptions(prev => ({ ...prev, showWarning: false }));
  };

  const importConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target.result);
        setConfig(importedConfig);
        
        // Check if imported config has placeholder values
        const hasPlaceholders = Object.values(importedConfig.mcpServers).some(server =>
          Object.values(server.env || {}).some(value => 
            typeof value === 'string' && value.includes('[ENTER_') && value.includes('_HERE]')
          )
        );
        
        const message = hasPlaceholders 
          ? 'Configuration imported - please enter your actual API keys in placeholder fields'
          : 'Configuration imported successfully';
          
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 5000);
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
    
    const exportConfig = createExportConfig();
    const configJson = JSON.stringify(exportConfig, null, 2);
    
    navigator.clipboard.writeText(configJson).then(() => {
      const message = exportOptions.includeSecrets 
        ? 'Configuration copied to clipboard with API keys - paste securely!'
        : 'Configuration copied to clipboard with placeholder values';
        
      setSuccessMessage(message);
      
      // Auto-clear clipboard after 2 minutes for security
      if (exportOptions.includeSecrets) {
        setTimeout(() => {
          navigator.clipboard.writeText('').catch(() => {});
        }, 120000);
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
    });
  };

  const clearSensitiveData = () => {
    const clearedConfig = {
      mcpServers: {}
    };
    
    Object.entries(config.mcpServers).forEach(([serverName, serverConfig]) => {
      clearedConfig.mcpServers[serverName] = {
        ...serverConfig,
        env: {}
      };
    });
    
    setConfig(clearedConfig);
    setSessionTimeout(null);
    setSuccessMessage('Sensitive environment variables cleared for security');
    setTimeout(() => setSuccessMessage(''), 3000);
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

      <SecurityNotice />

      {/* Developer Tools Warning */}
      {devToolsWarning && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">Security Warning: Browser developer tools may be open</span>
          </div>
          <p className="text-red-600 text-sm mt-1">Close developer tools before entering API keys to prevent accidental exposure.</p>
        </div>
      )}

      {/* Session Timeout Warning */}
      {sessionTimeout && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-blue-700">{sessionTimeout}</span>
            </div>
            <button
              onClick={clearSensitiveData}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Clear Sensitive Data
            </button>
          </div>
        </div>
      )}

      {/* Export Security Warning Modal */}
      {exportOptions.showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium">Export Security Warning</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Your configuration contains API keys and sensitive data. The exported file will include these secrets in plaintext.
            </p>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!exportOptions.includeSecrets}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeSecrets: !e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Export with placeholder values instead of actual API keys</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={performExport}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                {exportOptions.includeSecrets ? 'Export with Secrets' : 'Export with Placeholders'}
              </button>
              <button
                onClick={() => setExportOptions(prev => ({ ...prev, showWarning: false }))}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

        {Object.values(config.mcpServers).some(server => Object.keys(server.env || {}).length > 0) && (
          <button
            onClick={clearSensitiveData}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Secrets
          </button>
        )}
      </div>

      {/* Export Options */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Export Options:</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={exportOptions.includeSecrets}
            onChange={(e) => setExportOptions(prev => ({ ...prev, includeSecrets: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm">Include actual API keys in exports (uncheck for placeholder values)</span>
        </label>
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
                      placeholder="Variable name (e.g., API_KEY)"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    />
                    <div className="flex-1 relative mr-2">
                      <input
                        type={showPassword[`${serverName}-${key}`] ? "text" : "password"}
                        value={value}
                        onChange={(e) => updateEnvVar(serverName, key, key, e.target.value)}
                        placeholder={value.includes('[ENTER_') ? value : "Enter secret value"}
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
            {JSON.stringify(exportOptions.includeSecrets ? config : createExportConfig(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ClaudeConfigManager;