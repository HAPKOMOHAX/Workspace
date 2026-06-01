import {
    clearNativeSelection,
    isCreatingBlock,
    normalizeText,
    placeCaretToEnd,
} from './notebook-dom';

export function createNotebookEditing(ctx) {
    const {
        state,
        selectBlock,
        clearSelection,
        saveBlock,
        deleteBlock,
    } = ctx;

    async function finishEditing(block, { clearSelectionAfter = false } = {}) {
        if (!block || state.editingBlock !== block) {
            return;
        }

        const contentEl = block.querySelector('[data-content]');
        const content = normalizeText(contentEl.textContent || '');
        const wasCreating = isCreatingBlock(block);

        if (wasCreating && content === '') {
            state.editingBlock = null;
            clearNativeSelection();
            await deleteBlock(block);
            clearSelection();
            return;
        }

        if (clearSelectionAfter && state.selectedBlock === block) {
            block.classList.remove('is-selected');
            state.selectedBlock = null;
        }

        contentEl.contentEditable = 'false';
        block.dataset.editing = 'false';

        state.editingBlock = null;
        clearNativeSelection();
        contentEl.blur();

        if (content === '') {
            await deleteBlock(block);

            if (clearSelectionAfter) {
                clearSelection();
            }

            return;
        }

        await saveBlock(block);

        if (wasCreating) {
            block.dataset.state = 'created';
        }

        if (clearSelectionAfter) {
            clearSelection();
        } else {
            selectBlock(block);
        }
    }

    async function cancelEditing(block) {
        if (!block || state.editingBlock !== block) {
            return;
        }

        if (isCreatingBlock(block)) {
            state.editingBlock = null;
            clearNativeSelection();
            await deleteBlock(block);
            clearSelection();
            return;
        }

        await finishEditing(block, { clearSelectionAfter: true });
    }

    function startEditing(block) {
        if (state.editingBlock && state.editingBlock !== block) {
            finishEditing(state.editingBlock, { clearSelectionAfter: false }).catch(console.error);
        }

        const contentEl = block.querySelector('[data-content]');

        state.editingBlock = block;
        block.dataset.editing = 'true';
        selectBlock(block);

        clearNativeSelection();

        contentEl.contentEditable = 'true';
        contentEl.focus();
        placeCaretToEnd(contentEl);
    }

    return {
        startEditing,
        finishEditing,
        cancelEditing,
    };
}