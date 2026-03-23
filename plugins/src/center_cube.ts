export function centerCube(){
    Blockbench.on("add_cube", () => {
      const centerAction = BarItems['center_lateral'] as Action;
      if (centerAction) {
        centerAction.click();
      }
    });
}