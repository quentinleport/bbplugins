
export function setupLayerPanelObserver(track: (...items: Deletable[]) => void) {
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

function createAlphaLockButton(row: HTMLElement): HTMLElement {
    const btn = document.createElement('div');
    btn.className = 'in_list_button alpha-lock-btn';

    const icon = document.createElement('i');
    icon.className = 'material-icons icon';
    btn.appendChild(icon);

    btn.addEventListener('click', (event) => {
        event.stopPropagation();
        const uuid = row.getAttribute('layer_id');
        const layer = uuid ? TextureLayer.all.find(x => x.uuid === uuid) : null;
        if (layer) layer.toggleAlphaLock();
    });

    return btn;
}

function insertAlphaLockButton(row: HTMLElement, btn: HTMLElement): void {
    const visibilityBtn = row.querySelector('div.in_list_button');
    if (visibilityBtn && visibilityBtn.parentNode) {
        visibilityBtn.parentNode.insertBefore(btn, visibilityBtn.nextSibling);
    } else {
        row.appendChild(btn);
    }
}

function updateAlphaLockButtonState(btn: HTMLElement, locked: boolean): void {
    const icon = btn.querySelector<HTMLElement>('i');
    if (!icon) return;
    icon.textContent = locked ? 'lock' : 'lock_open';
    icon.classList.toggle('toggle_disabled', !locked);
}

function refreshLayerRow(row: HTMLElement): void {
    const uuid = row.getAttribute('layer_id');
    if (!uuid) return;

    const layer = TextureLayer.all.find(l => l.uuid === uuid);
    if (!layer) return;

    let btn = row.querySelector<HTMLElement>('div.alpha-lock-btn');
    if (!btn) {
        btn = createAlphaLockButton(row);
        insertAlphaLockButton(row, btn);
    }

    updateAlphaLockButtonState(btn, layer.alpha_lock === true);
}

export function refreshLayerIcons() {
    const panel = Interface.Panels.layers;
    if (!panel) return;
    const panelNode = panel.node;
    if (!panelNode) return;

    panelNode.querySelectorAll<HTMLElement>('li.texture_layer[layer_id]').forEach(refreshLayerRow);
}