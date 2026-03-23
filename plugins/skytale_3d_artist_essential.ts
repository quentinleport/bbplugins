import { centerCube } from "./src/center_cube";
import { setupLayerAlphaLock, cleanupLayerAlphaLock } from "./src/layer_alpha_lock"

let customActions: Action[] = [];

BBPlugin.register("skytale_3d_artist_essential", {
  title: "Skytale 3D Artist Essential Plugin",
  author: "Quentin Le Port",
  description: "An simple plugin containing basic functions to help 3D artists using Blockbench.",
  icon: "star",
  version: "1.0.0",
  variant: "both",

  onload() {
    //Add cube position override
    centerCube();

    // Setup layer alpha lock feature
    setupLayerAlphaLock();
  },

  onunload() {
    // This runs when the plugin unloads

    // Clean up alpha lock feature
    cleanupLayerAlphaLock();

    // Clean up other actions
    console.log("removing actions")
    for (const action of customActions) {
      console.log(action.name)
      action.delete();
    }
    console.log("Skytale 3D Artist Essential Plugin unloaded!");
  },

  oninstall() {
    Blockbench.showMessageBox({
      title: "Skytale 3D Artist Essential Plugin Installed",
      message: "Thank you for installing the Skytale 3D Artist Essential Plugin!",
    });
  },

  onuninstall() {
    console.log("Skytale 3D Artist Essential Plugin uninstalled!");
  },
});
