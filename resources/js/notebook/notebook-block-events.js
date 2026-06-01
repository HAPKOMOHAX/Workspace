import {
    clearNativeSelection,
    ensureBlockControls,
} from './notebook-dom';

export function createNotebookBlockEvents({
    state,
    selectBlock,
    startEditing,
    finishEditing,
    cancelEditing,
    deleteBlock,
    bindBlockDrag,
}) {
    function bindBlock(block) {
        if (!block.dataset.editing) {
            block.dataset.editing = 'false';
        }

        if (!block.dataset.state) {
            block.dataset.state = 'created';
        }

        ensureBlockControls(block);

        const contentEl = block.querySelector('[data-content]');
        const editButton = block.querySelector('[data-action="edit"]');
        const closeButton = block.querySelector('[data-action="close"]');
        const deleteButton = block.querySelector('[data-action="delete"]');
        const saveButton = block.querySelector('[data-action="save"]');

        block.addEventListener('click', (event) => {
            event.stopPropagation();

            if (state.dragState?.moved) {
                return;
            }

            selectBlock(block);
        });

        block.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            clearNativeSelection();
            startEditing(block);
        });

        contentEl.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            clearNativeSelection();
            startEditing(block);
        });

        editButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            startEditing(block);
        });

        closeButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            cancelEditing(block).catch(console.error);
        });

        saveButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            finishEditing(block, { clearSelectionAfter: false }).catch(console.error);
        });

        deleteButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            deleteBlock(block).catch(console.error);
        });

        contentEl.addEventListener('blur', (event) => {
            const nextTarget = event.relatedTarget;

            if (nextTarget?.closest('.notebook-block__action-btn')) {
                return;
            }

            if (state.editingBlock === block) {
                finishEditing(block, { clearSelectionAfter: false }).catch(console.error);
            }
        });

        contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();

                cancelEditing(block).catch(console.error);
                return;
            }

            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                finishEditing(block, { clearSelectionAfter: false }).catch(console.error);
            }
        });

        bindBlockDrag(block);
    }

    return {
        bindBlock,
    };
}