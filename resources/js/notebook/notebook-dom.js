export function normalizeText(text) {
    return text.replace(/\r\n/g, '\n').trim();
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getCanvasForBlock(block, fallbackCanvas = null) {
    return fallbackCanvas ?? block.closest('[data-canvas]');
}

export function clearNativeSelection() {
    const selection = window.getSelection();

    if (selection) {
        selection.removeAllRanges();
    }
}

export function isCreatingBlock(block) {
    return block?.dataset.state === 'creating';
}

export function getClampedPosition(block, x, y, fallbackCanvas = null) {
    const canvas = getCanvasForBlock(block, fallbackCanvas);

    if (!canvas) {
        return {
            x: Math.max(0, Math.round(x)),
            y: Math.max(0, Math.round(y)),
        };
    }

    const maxX = Math.max(0, canvas.clientWidth - block.offsetWidth);
    const maxY = Math.max(0, canvas.clientHeight - block.offsetHeight);

    return {
        x: clamp(Math.round(x), 0, maxX),
        y: clamp(Math.round(y), 0, maxY),
    };
}

const COLLISION_GAP = 1;

function getBlockRectAt(block, x, y, fallbackCanvas = null) {
    const position = getClampedPosition(block, x, y, fallbackCanvas);

    return {
        left: position.x,
        top: position.y,
        right: position.x + block.offsetWidth,
        bottom: position.y + block.offsetHeight,
    };
}

function expandRect(rect, gap = COLLISION_GAP) {
    return {
        left: rect.left - gap,
        top: rect.top - gap,
        right: rect.right + gap,
        bottom: rect.bottom + gap,
    };
}

function rectsOverlap(a, b) {
    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

export function blockCollides(block, x, y, fallbackCanvas = null) {
    const canvas = getCanvasForBlock(block, fallbackCanvas);

    if (!canvas) {
        return false;
    }

    const currentRect = expandRect(getBlockRectAt(block, x, y, canvas));

    return [...canvas.querySelectorAll('.notebook-block')].some((otherBlock) => {
        if (otherBlock === block) {
            return false;
        }

        const otherRect = getBlockRectAt(
            otherBlock,
            otherBlock.offsetLeft,
            otherBlock.offsetTop,
            canvas
        );

        return rectsOverlap(currentRect, otherRect);
    });
}

export function findFreePosition(block, preferredX, preferredY, fallbackCanvas = null) {
    const canvas = getCanvasForBlock(block, fallbackCanvas);
    const preferred = getClampedPosition(block, preferredX, preferredY, canvas);

    if (!blockCollides(block, preferred.x, preferred.y, canvas)) {
        return preferred;
    }

    const step = 24;
    const maxRadius = Math.max(canvas?.clientWidth ?? 0, canvas?.clientHeight ?? 0);
    const checked = new Set();

    for (let radius = step; radius <= maxRadius; radius += step) {
        for (let dy = -radius; dy <= radius; dy += step) {
            for (let dx = -radius; dx <= radius; dx += step) {
                if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
                    continue;
                }

                const candidate = getClampedPosition(
                    block,
                    preferred.x + dx,
                    preferred.y + dy,
                    canvas
                );

                const key = `${candidate.x}:${candidate.y}`;

                if (checked.has(key)) {
                    continue;
                }

                checked.add(key);

                if (!blockCollides(block, candidate.x, candidate.y, canvas)) {
                    return candidate;
                }
            }
        }
    }

    return preferred;
}

export function readPosition(block) {
    return {
        x: block.offsetLeft,
        y: block.offsetTop,
    };
}

export function setPosition(block, x, y, fallbackCanvas = null) {
    const clamped = getClampedPosition(block, x, y, fallbackCanvas);

    block.style.left = `${clamped.x}px`;
    block.style.top = `${clamped.y}px`;

    return clamped;
}

function createActionButton({ className, action, label, text }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.dataset.action = action;
    button.setAttribute('aria-label', label);
    button.textContent = text;

    return button;
}

function createSelectedActionsElement() {
    const selectedActions = document.createElement('div');
    selectedActions.className = 'notebook-block__actions notebook-block__actions--selected';

    const editButton = createActionButton({
        className: 'notebook-block__action-btn notebook-block__action-btn--edit',
        action: 'edit',
        label: 'Редактировать блок',
        text: '✎',
    });

    selectedActions.appendChild(editButton);

    return selectedActions;
}

function createEditingActionsElement() {
    const editingActions = document.createElement('div');
    editingActions.className = 'notebook-block__actions notebook-block__actions--editing';

    const closeButton = createActionButton({
        className: 'notebook-block__action-btn notebook-block__action-btn--close',
        action: 'close',
        label: 'Выйти из редактирования',
        text: '×',
    });

    const deleteButton = createActionButton({
        className: 'notebook-block__action-btn notebook-block__action-btn--delete',
        action: 'delete',
        label: 'Удалить блок',
        text: '🗑',
    });

    const saveButton = createActionButton({
        className: 'notebook-block__action-btn notebook-block__action-btn--save',
        action: 'save',
        label: 'Сохранить изменения',
        text: '✓',
    });

    editingActions.appendChild(closeButton);
    editingActions.appendChild(deleteButton);
    editingActions.appendChild(saveButton);

    return editingActions;
}

export function ensureBlockControls(block) {
    const hasSelectedActions = block.querySelector('.notebook-block__actions--selected');
    const hasEditingActions = block.querySelector('.notebook-block__actions--editing');

    if (hasSelectedActions && hasEditingActions) {
        return;
    }

    const contentEl = block.querySelector('[data-content]');

    if (!contentEl) {
        return;
    }

    const selectedActions = createSelectedActionsElement();
    const editingActions = createEditingActionsElement();

    block.insertBefore(selectedActions, contentEl);
    block.insertBefore(editingActions, contentEl);
}

export function createBlockElement(blockData) {
    const block = document.createElement('article');
    block.className = 'notebook-block';
    block.dataset.id = String(blockData.id);
    block.dataset.editing = 'false';
    block.dataset.state = blockData.state ?? 'created';

    const selectedActions = createSelectedActionsElement();
    const editingActions = createEditingActionsElement();

    const content = document.createElement('div');
    content.className = 'notebook-block__content';
    content.dataset.content = '';
    content.textContent = blockData.content ?? '';

    block.appendChild(selectedActions);
    block.appendChild(editingActions);
    block.appendChild(content);

    return block;
}

export function placeCaretToEnd(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    const selection = window.getSelection();

    if (!selection) {
        return;
    }

    selection.removeAllRanges();
    selection.addRange(range);
}