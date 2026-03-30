//Use declaration merging to prevent uses of any in the code when adding new porperties
declare global {
    interface TextureLayer {
        alpha_lock: boolean;
        toggleAlphaLock(): TextureLayer;
    }
}

const trackItems: Deletable[] = [];

function track(...items: Deletable[]) {
    trackItems.push(...items);
}

function syncAlphaLock() {
    const layer = TextureLayer.selected;
    // @ts-ignore — Painter.lock_alpha is typed Const but is writable at runtime
    Painter.lock_alpha = layer ? !!layer.alpha_lock : false;
}

function refreshLayerIcons() {
    const panel = Interface.Panels.layers;
    if (!panel) return;
    const panelNode = panel.node;
    if (!panelNode) return;

    const layerRows = panelNode.querySelectorAll<HTMLElement>('li.texture_layer[layer_id]');
    layerRows.forEach(row => {
        const uuid = row.getAttribute('layer_id');
        if (!uuid) return;

        const layer = TextureLayer.all.find(l => l.uuid === uuid);
        if (!layer) return;

        // Find or create the lock button
        let btn = row.querySelector<HTMLElement>('div.alpha-lock-btn');
        if (!btn) {
            btn = document.createElement('div');
            btn.className = 'in_list_button alpha-lock-btn';

            const icon = document.createElement('i');
            icon.className = 'material-icons icon';
            btn.appendChild(icon);

            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const rowUuid = row.getAttribute('layer_id');
                const layerWithButton = rowUuid ? TextureLayer.all.find(x => x.uuid === rowUuid) : null;
                if (layerWithButton) layerWithButton.toggleAlphaLock();
            });

            // Insert after the visibility button
            const visibilityBtn = row.querySelector('div.in_list_button');
            if (visibilityBtn && visibilityBtn.parentNode) {
                visibilityBtn.parentNode.insertBefore(btn, visibilityBtn.nextSibling);
            } else {
                row.appendChild(btn);
            }
        }

        // Update icon state
        const icon = btn.querySelector<HTMLElement>('i');
        if (!icon) return;
        const locked = layer.alpha_lock === true;
        icon.textContent = locked ? 'lock' : 'lock_open';
        if (locked) {
            icon.classList.remove('toggle_disabled');
        } else {
            icon.classList.add('toggle_disabled');
        }
    });
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

function setupLayerPanelObserver() {
    const panel = Interface.Panels.layers;
    let refreshScheduled = false;
    const observer = new MutationObserver(() => {
        if (refreshScheduled) return;
        refreshScheduled = true;
        requestAnimationFrame(() => {
            refreshScheduled = false;
            observer.disconnect();
            refreshLayerIcons();
            observer.observe(panel.node, { childList: true, subtree: true });
        });
    });
    observer.observe(panel.node, { childList: true, subtree: true });
    track({ delete() { observer.disconnect(); } });
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
    setupLayerPanelObserver();
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