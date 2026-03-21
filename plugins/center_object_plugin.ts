
let exampleButton : Action;

BBPlugin.register("example_plugin", {
  title: "Example Plugin",
  author: "Your Name",
  description: "An example plugin to demonstrate the basic structure",
  icon: "star",
  version: "1.0.0",
  variant: "both",

  onload() {
    // This runs when the plugin loads
    console.log("Example plugin loaded!");

    // Create an action/button
    exampleButton = new Action("example_action", {
      name: "Example Action",
      description: "This is an example action",
      icon: "star",
      click: function () {
        Blockbench.showQuickMessage("Example plugin clicked!");
      },
    });

    // Add the action to a menu
    MenuBar.addAction(exampleButton, "tools");
    Blockbench.on("add_cube", (data: {}) => {
      console.log("Cube added!", data);
    });
  },

  onunload() {
    // This runs when the plugin unloads
    // Always clean up your actions/UI elements
    exampleButton.delete();
    console.log("Example plugin unloaded!");
  },

  oninstall() {
    // This runs when the plugin is installed
    Blockbench.showMessageBox({
      title: "Example Plugin Installed",
      message: "Thank you for installing the Example Plugin!",
    });
  },

  onuninstall() {
    // This runs when the plugin is uninstalled
    console.log("Example plugin uninstalled!");
  },
});
