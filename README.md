# Claude MCP Configuration Manager

A visual tool for creating and managing Claude Desktop MCP (Model Context Protocol) configuration files with validation and error prevention.

## 🎯 Why This Tool?

Managing Claude Desktop MCP configurations can be tricky - a single syntax error, missing comma, or incorrect bracket can break your entire setup. This tool provides a user-friendly interface that eliminates configuration errors and makes managing multiple MCP servers simple.

## ✨ Features

- **Visual Editor**: No need to write JSON manually - use forms and buttons
- **Real-time Validation**: Catch errors before they break your configuration
- **Quick Templates**: Pre-configured setups for popular MCP servers
- **Import/Export**: Load existing configs and export properly formatted files
- **Security-First Design**: Local processing with comprehensive privacy protection
- **JSON Preview**: See the actual configuration that will be generated
- **Selective Export**: Choose to export with actual secrets or placeholder values

## 🔒 Security & Privacy

### **Local Processing Only**
- **All data stays in your browser** - no server-side processing
- **Zero external API calls** - no data transmission to any servers
- **Client-side only architecture** - hosted as static files on Cloudflare Pages

### **Comprehensive Security Features**
- **Developer Tools Detection**: Warns when dev tools are open during API key entry
- **Export Security Options**: Choose between including actual secrets or placeholder values
- **Session Timeout Warnings**: Reminds you to clear sensitive data after 30 minutes
- **Auto-Clear Clipboard**: Automatically clears clipboard after 2 minutes when copying secrets
- **Secure Data Clearing**: One-click button to remove all environment variables
- **Password Field Masking**: All sensitive values are hidden by default
- **Import Placeholder Detection**: Automatically detects and warns about placeholder values

### **Security Best Practices**
- **Close browser developer tools** when entering API keys to prevent accidental exposure
- **Store exported config files securely** and limit access permissions
- **Use environment-specific keys** - avoid production keys for testing configurations
- **Regularly rotate API keys** per service security recommendations
- **Clear sensitive data** when finished configuring or before sharing your screen

## 🚀 Quick Start

### Option 1: Use Online (Recommended)

Visit **[https://claude-mcp-config-manager.pages.dev](https://claude-mcp-config-manager.pages.dev)** - no installation required!

### Option 2: Run Locally

1. Clone this repository:
```bash
git clone https://github.com/pauliestevens/claude-mcp-config-manager.git
cd claude-mcp-config-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

### Adding MCP Servers

1. **Start Fresh**: Click "Add MCP Server" to create a new configuration
2. **Use Templates**: Click on common server types (GitHub, Filesystem, etc.) for quick setup
3. **Import Existing**: Load your current `claude_desktop_config.json` file

### Configuring Servers

- **Server Name**: Give your MCP server a descriptive name
- **Command**: The executable command (e.g., `npx`, `python`, `node`)
- **Arguments**: Add command-line arguments one by one
- **Environment Variables**: Set required API keys and configuration values (automatically masked)

### Secure Export Options

1. **With Actual Secrets**: Exports your real API keys (shows security warning)
2. **With Placeholders**: Exports template with `[ENTER_API_KEY_HERE]` style placeholders
3. **Copy to Clipboard**: Includes auto-clear functionality for security

### Security Indicators

- 🟡 **Yellow Warning**: Browser dev tools detected - close before entering secrets
- 🔵 **Blue Notice**: Session timeout reminder after 30 minutes with sensitive data
- 🔒 **Export Warning**: Modal confirmation when exporting files with actual API keys

## 🔧 Common MCP Server Configurations

### GitHub Integration
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
    }
  }
}
```

### Filesystem Access
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"],
    "env": {}
  }
}
```

### Brave Search
```json
{
  "brave": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "your_api_key_here"
    }
  }
}
```

### PostgreSQL Database
```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@host:port/db"
    }
  }
}
```

## 🏗️ Built With

- **React 18** - User interface framework
- **Tailwind CSS** - Styling and responsive design
- **Lucide React** - Beautiful, consistent icons
- **Create React App** - Build tooling and development server

## 📁 Configuration File Location

Place your generated `claude_desktop_config.json` file in:

- **macOS**: `~/Library/Application Support/Claude/`
- **Windows**: `%APPDATA%\Claude\`

## 🛡️ Security Architecture

### Data Flow
1. **Input**: User enters configuration via web interface
2. **Processing**: All validation and JSON generation happens in browser memory
3. **Storage**: Data exists only in React component state (no persistent storage)
4. **Output**: Files generated locally via browser download API or clipboard

### Privacy Guarantees
- **No telemetry or analytics** - we don't track usage
- **No external dependencies** - all processing libraries are bundled
- **No server logging** - static hosting means no server-side data collection
- **No cookies or local storage** - no persistent data beyond the current session

### Threat Model Protection
- ✅ **Accidental exposure via dev tools** - Detection and warnings
- ✅ **Clipboard data persistence** - Auto-clear after 2 minutes
- ✅ **File export with secrets** - Confirmation dialogs and options
- ✅ **Session data persistence** - Timeout warnings and clear functions
- ✅ **Network data leakage** - Zero external API calls
- ✅ **Shoulder surfing** - Password field masking by default

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. When contributing:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Security Contributions
If you discover security vulnerabilities or have suggestions for security improvements, please:
1. Open an issue with the "security" label
2. Provide detailed information about the concern
3. Suggest potential mitigations if possible

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Issues & Support

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/pauliestevens/claude-mcp-config-manager/issues) on GitHub.

## 🙏 Acknowledgments

- Thanks to Anthropic for creating Claude and the MCP protocol
- Inspired by the need for better developer tooling around MCP configurations
- Built with security and privacy as fundamental design principles

## 📊 Project Status

- ✅ **Production Ready**: Fully functional and secure
- ✅ **Actively Maintained**: Regular updates and security patches
- ✅ **Community Driven**: Open to contributions and feedback
- 🔄 **Continuously Improved**: Based on user feedback and security best practices

---

**Live Demo**: [https://claude-mcp-config-manager.pages.dev](https://claude-mcp-config-manager.pages.dev)

**Repository**: [https://github.com/pauliestevens/claude-mcp-config-manager](https://github.com/pauliestevens/claude-mcp-config-manager)