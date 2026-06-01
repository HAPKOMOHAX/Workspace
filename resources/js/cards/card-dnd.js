import { reorderCards } from './card-api';
import { emitCardsChanged } from './card-events';

export function initCardDnD({
    root,
    reorderUrl,
    columnSelector,
    contentSelector,
    cardSelector = '.task-card',
}) {
    if (!root || !reorderUrl) {
        return;
    }

    const state = {
        root,
        reorderUrl,
        columnSelector,
        contentSelector,
        cardSelector,
        draggedCard: null,
        sourceContent: null,
        snapshot: null,
    };

    const cards = root.querySelectorAll(cardSelector);
    const dropZones = root.querySelectorAll(columnSelector);

    cards.forEach((card) => bindCard(card, state));
    dropZones.forEach((column) => bindDropZone(column, state));
}

function bindCard(card, state) {
    card.addEventListener('dragstart', (event) => {
        state.draggedCard = card;
        state.sourceContent = getClosestContent(card, state);
        state.snapshot = snapshotColumns(state.root, state);

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', card.dataset.id || '');

        requestAnimationFrame(() => {
            card.classList.add('is-dragging');
        });
    });

    card.addEventListener('dragend', () => {
        markCardAsJustDragged(card);
        cleanupDragState(state);
    });
}

function bindDropZone(column, state) {
    const content = column.querySelector(state.contentSelector);

    if (!content) {
        return;
    }

    column.addEventListener('dragover', (event) => {
        if (!state.draggedCard) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        column.classList.add('is-drop-target');
        content.classList.add('is-drop-target');

        const draggingCard = state.draggedCard;
        const afterElement = getDragAfterElement(
            content,
            event.clientY,
            draggingCard,
            state.cardSelector
        );

        if (afterElement) {
            content.insertBefore(draggingCard, afterElement);
        } else {
            content.appendChild(draggingCard);
        }

        syncContentEmptyState(content, state);

        if (state.sourceContent && state.sourceContent !== content) {
            syncContentEmptyState(state.sourceContent, state);
        }
    });

    column.addEventListener('dragleave', (event) => {
        const nextElement = document.elementFromPoint(event.clientX, event.clientY);

        if (nextElement && column.contains(nextElement)) {
            return;
        }

        column.classList.remove('is-drop-target');
        content.classList.remove('is-drop-target');
    });

    column.addEventListener('drop', async (event) => {
        event.preventDefault();

        const card = state.draggedCard;
        if (!card) {
            return;
        }

        const sourceColumn = getClosestColumn(state.sourceContent, state);
        const targetColumn = column;

        if (!sourceColumn || !targetColumn) {
            cleanupDragState(state);
            return;
        }

        const columns = collectAffectedColumns(sourceColumn, targetColumn, state);

        if (!hasColumnsChanged(state.snapshot, columns)) {
            cleanupDragState(state);
            return;
        }

        try {
            await reorderCards({
                reorderUrl: state.reorderUrl,
                columns,
            });

            syncCardDomState(columns, state);
            syncAllEmptyStates(state);
            emitCardsChanged({ type: 'reordered' });
        } catch (error) {
            restoreSnapshot(state.snapshot, state);
            console.error(error);
            alert(error.message || 'Не удалось сохранить порядок карточек.');
        } finally {
            cleanupDragState(state);
        }
    });
}

function getClosestColumn(node, state) {
    return node?.closest(state.columnSelector) ?? null;
}

function getClosestContent(node, state) {
    return node?.closest(state.contentSelector) ?? null;
}

function getDragAfterElement(container, clientY, draggedCard, cardSelector) {
    const INSERT_BIAS_Y = 12;

    const cards = [...container.querySelectorAll(cardSelector)]
        .filter((card) => card !== draggedCard);

    let closest = {
        offset: Number.NEGATIVE_INFINITY,
        element: null,
    };

    for (const card of cards) {
        const box = card.getBoundingClientRect();
        const offset = (clientY - INSERT_BIAS_Y) - (box.top + box.height / 2);

        if (offset < 0 && offset > closest.offset) {
            closest = {
                offset,
                element: card,
            };
        }
    }

    return closest.element;
}

function collectAffectedColumns(sourceColumn, targetColumn, state) {
    const columns = [sourceColumn];

    if (targetColumn !== sourceColumn) {
        columns.push(targetColumn);
    }

    return columns
        .map((column) => serializeColumn(column, state))
        .filter(Boolean);
}

function serializeColumn(column, state) {
    const date = column.dataset.date;
    const content = column.querySelector(state.contentSelector);

    if (!date || !content) {
        return null;
    }

    const task_ids = [...content.querySelectorAll(state.cardSelector)]
        .map((card) => Number(card.dataset.id))
        .filter(Boolean);

    return { date, task_ids };
}

function snapshotColumns(root, state) {
    return [...root.querySelectorAll(state.columnSelector)]
        .map((column) => serializeColumn(column, state))
        .filter(Boolean);
}

function hasColumnsChanged(snapshot, currentColumns) {
    if (!snapshot) {
        return true;
    }

    const snapshotMap = new Map(snapshot.map((column) => [column.date, column.task_ids.join(',')]));
    const currentMap = new Map(currentColumns.map((column) => [column.date, column.task_ids.join(',')]));

    if (snapshotMap.size !== currentMap.size) {
        return true;
    }

    for (const [date, ids] of currentMap) {
        if (snapshotMap.get(date) !== ids) {
            return true;
        }
    }

    return false;
}

function restoreSnapshot(snapshot, state) {
    if (!snapshot) {
        return;
    }

    const cardMap = new Map(
        [...state.root.querySelectorAll(state.cardSelector)].map((card) => [String(card.dataset.id), card])
    );

    snapshot.forEach((columnData) => {
        const column = state.root.querySelector(`${state.columnSelector}[data-date="${columnData.date}"]`);
        const content = column?.querySelector(state.contentSelector);

        if (!content) {
            return;
        }

        columnData.task_ids.forEach((taskId) => {
            const card = cardMap.get(String(taskId));
            if (card) {
                content.appendChild(card);
            }
        });
    });

    syncCardDomState(snapshot, state);
    syncAllEmptyStates(state);
}

function syncCardDomState(columns, state) {
    columns.forEach((column) => {
        const columnElement = state.root.querySelector(`${state.columnSelector}[data-date="${column.date}"]`);
        const content = columnElement?.querySelector(state.contentSelector);

        if (!content) {
            return;
        }

        const cards = content.querySelectorAll(state.cardSelector);

        cards.forEach((card, index) => {
            card.dataset.scheduledFor = column.date;
            card.dataset.position = String(index + 1);
        });
    });
}

function cleanupDragState(state) {
    state.root.querySelectorAll(`${state.contentSelector}.is-drop-target`).forEach((content) => {
        content.classList.remove('is-drop-target');
    });

    state.root.querySelectorAll(`${state.columnSelector}.is-drop-target`).forEach((column) => {
        column.classList.remove('is-drop-target');
    });

    if (state.draggedCard) {
        state.draggedCard.classList.remove('is-dragging');
    }

    state.draggedCard = null;
    state.sourceContent = null;
    state.snapshot = null;

    syncAllEmptyStates(state);
}

function markCardAsJustDragged(card) {
    card.dataset.justDragged = 'true';

    window.setTimeout(() => {
        if (card.isConnected) {
            delete card.dataset.justDragged;
        }
    }, 180);
}

function syncContentEmptyState(content, state) {
    if (!content) {
        return;
    }

    const emptyNode = content.querySelector('[data-empty-state]');
    const cardsCount = content.querySelectorAll(state.cardSelector).length;
    const emptyMessage = content.dataset.emptyMessage;

    if (cardsCount > 0) {
        if (emptyNode) {
            emptyNode.remove();
        }
        return;
    }

    if (!emptyNode && emptyMessage) {
        const emptyElement = document.createElement('div');
        emptyElement.className = getEmptyStateClass(content, state);
        emptyElement.dataset.emptyState = 'true';
        emptyElement.textContent = emptyMessage;
        content.appendChild(emptyElement);
    }
}

function syncAllEmptyStates(state) {
    state.root.querySelectorAll(state.contentSelector).forEach((content) => {
        syncContentEmptyState(content, state);
    });
}

function getEmptyStateClass(content, state) {
    const column = content.closest(state.columnSelector);

    if (column?.classList.contains('week-column')) {
        return 'week-column__empty';
    }

    if (column?.classList.contains('day-column')) {
        return 'day-column__empty';
    }

    if (column?.classList.contains('month-day')) {
        return 'month-day__empty';
    }

    return 'column-empty';
}