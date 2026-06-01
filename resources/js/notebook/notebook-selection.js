export function createNotebookSelection(state) {
    function selectBlock(block) {
        if (state.selectedBlock && state.selectedBlock !== block) {
            state.selectedBlock.classList.remove('is-selected');
        }

        state.selectedBlock = block;

        if (state.selectedBlock) {
            state.selectedBlock.classList.add('is-selected');
        }
    }

    function clearSelection() {
        if (state.selectedBlock) {
            state.selectedBlock.classList.remove('is-selected');
        }

        state.selectedBlock = null;
    }

    return {
        selectBlock,
        clearSelection,
    };
}