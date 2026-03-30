import { refreshLayerIcons, setupLayerPanelObserver } from "./layer_alpha_lock_ui";

//Texture Layer type use declaration merging to add additional property
const trackItems: Deletable[] = [];

function track(...items: Deletable[]) {
    trackItems.push(...items);
}

function syncAlphaLock() {
    const layer = TextureLayer.selected;
    // @ts-ignore — Painter.lock_alpha is typed Const but is writable at runtime
    Painter.lock_alpha = layer ? !!layer.alpha_lock : false;
}

function setupProperty() {
    track(new Property(TextureLayer, 'boolean', 'alpha_lock', { default: false }));
}

function setupPrototypeMethods() {
    // @ts-ignore — assigning to prototype; return this to keep consistency with blockbench native style 
    TextureLayer.prototype.toggleAlphaLock = function (this: TextureLayer) {
        Undo.initEdit({ textures: [this.texture] });
        this.alpha_lock = !this.alpha_lock;
        this.texture.updateChangesAfterEdit();
        refreshLayerIcons();
        syncAlphaLock();
        return this;
    };
    track({
        delete() { // @ts-ignore
            delete TextureLayer.prototype.toggleAlphaLock;
        }
    });

    const _origSelect = TextureLayer.prototype.select;
    TextureLayer.prototype.select = function (this: TextureLayer) {
        const result = _origSelect.call(this);
        syncAlphaLock();
        return result;
    };
    track({ delete() { TextureLayer.prototype.select = _origSelect; } });
}

function setupContextMenu() {
    const action = new Action('toggle_layer_alpha_lock', {
        name: 'Toggle Alpha Lock',
        icon: 'lock',
        category: 'layers',
        condition: () => TextureLayer.selected != null,
        click() {
            // @ts-ignore
            if (TextureLayer.selected) TextureLayer.selected.toggleAlphaLock();
        }
    });
    track(action);

    // @ts-expect-error — menu property not in public typings
    const menu: Menu = TextureLayer.prototype.menu;
    menu.addAction(action, '#painting');
    track({ delete() { menu.removeAction('toggle_layer_alpha_lock'); } });
}

export function setupLayerAlphaLock() {
    setupProperty();
    setupPrototypeMethods();
    setupLayerPanelObserver(track);
    refreshLayerIcons();
    track(Blockbench.on('update_texture_selection', syncAlphaLock));
    setupContextMenu();
}

export function cleanupLayerAlphaLock() {
    // Remove all injected lock icon buttons from the DOM
    const panel = Interface.Panels.layers;
    if (panel && panel.node) {
        panel.node.querySelectorAll('.alpha-lock-btn').forEach(el => el.remove());
    }

    // Delete all tracked items
    for (const item of trackItems) {
        try {
            item.delete();
        } catch (e) {
            console.error('Alpha lock cleanup error:', e);
        }
    }
    trackItems.splice(0);
}