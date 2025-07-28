# Claude MCP Configuration Manager

A visual tool for creating and managing Claude Desktop MCP (Model Context Protocol) configuration files with validation and error prevention.

## 🎯 Why This Tool?

Managing Claude Desktop MCP configurations can be tricky - a single syntax error, missing comma, or incorrect bracket can break your entire setup. This tool provides a user-friendly interface that eliminates configuration errors and makes managing multiple MCP servers simple.

## ✨ Features

- **Visual Editor**: No need to write JSON manually - use forms and buttons
- **Real-time Validation**: Catch errors before they break your configuration
- **Quick Templates**: Pre-configured setups for popular MCP servers
- **Import/Export**: Load existing configs and export properly formatted files
- **Security**: Password masking for sensitive environment variables
- **JSON Preview**: See the actual configuration that will be generated

## 🚀 Quick Start

### Option 1: Run Locally

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

### Option 2: Use Online (Coming Soon)

A hosted version will be available soon for immediate use without installation.

## 📖 How to Use

### Adding MCP Servers

1. **Start Fresh**: Click "Add MCP Server" to create a new configuration
2. **Use Templates**: Click on common server types (GitHub, Filesystem, etc.) for quick setup
3. **Import Existing**: Load your current `claude_desktop_config.json` file

### Configuring Servers

- **Server Name**: Give your MCP server a descriptive name
- **Command**: The executable command (e.g., `npx`, `python`, `node`)
- **Arguments**: Add command-line arguments one by one
- **Environment Variables**: Set required API keys and configuration values

### Exporting Configuration

1. Ensure all validation errors are fixed (they'll show in red)
2. Click "Export Config" to download `claude_desktop_config.json`
3. Or use "Copy to Clipboard" for quick pasting

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

## 🏗️ Built With

- **React 18** - User interface framework
- **Tailwind CSS** - Styling and responsive design
- **Lucide React** - Beautiful icons
- **Create React App** - Build tooling

## 🔒 Security & Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Configuration files are generated client-side
- Sensitive values are masked in the interface

## 📁 Configuration File Location

Place your generated `claude_desktop_config.json` file in:

- **macOS**: `~/Library/Application Support/Claude/`
- **Windows**: `%APPDATA%\Claude\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Issues & Support

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/pauliestevens/claude-mcp-config-manager/issues) on GitHub.

## 🙏 Acknowledgments

- Thanks to Anthropic for creating Claude and the MCP protocol
- Inspired by the need for better developer tooling around MCP configurations