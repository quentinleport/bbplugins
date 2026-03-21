# Blockbench Plugins

This repository contains custom plugins for Blockbench.

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. The `blockbench-types` package provides TypeScript autocomplete support for the Blockbench API.

## Plugin Structure

Each plugin should be a separate `.js` file following this structure:

```javascript
Plugin.register("plugin_id", {
  title: "Plugin Name",
  author: "Your Name",
  icon: "icon",
  description: "Your Description",
  version: "1.0.0",
  variant: "both",
  onload() {
    // Plugin code here
  },
  onunload() {
    // Cleanup code here
  },
});
```

## Testing Plugins

To test a plugin:

1. Open Blockbench
2. Drag and drop the `.js` file into Blockbench, or load it from the plugin menu
3. Use Ctrl/Cmd + J to reload the plugin after making changes

## Resources

- [Blockbench Plugin Documentation](https://www.blockbench.net/wiki/docs/plugin)
- [Blockbench API Types](https://www.npmjs.com/package/blockbench-types)
- [Submit Plugin](https://github.com/JannisX11/blockbench-plugins)
