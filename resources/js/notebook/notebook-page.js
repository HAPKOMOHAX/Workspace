import { createNotebookApi } from './notebook-api';
import { createNotebookDrag } from './notebook-drag';
import { createNotebookCreation } from './notebook-creation';
import { createNotebookBlockEvents } from './notebook-block-events';
import { createNotebookEditing } from './notebook-editing';
import { createNotebookSelection } from './notebook-selection';
import {
    clearNativeSelection,
    findFreePosition,
    normalizeText,
    readPosition,
    setPosition,
} from './notebook-dom';

export function initNotebookPage() {
  
    const root = document.querySelector('.notebook-page');
    if (!root) return;

    const canvas = root.querySelector('[data-canvas]');
    if (!canvas) return;

    const api = createNotebookApi({
        storeUrl: root.dataset.storeUrl,
        updateUrlTemplate: root.dataset.updateUrlTemplate,
        destroyUrlTemplate: root.dataset.destroyUrlTemplate,
        sheetId: Number(root.dataset.sheetId),
    });

    const state = {
        selectedBlock: null,
        editingBlock: null,
        dragState: null,
    };

    const updateCanvasHeight = () => {
        const bottomPadding = 160;
        const minHeight = Math.max(0, window.innerHeight - 140);

        const blocks = [...canvas.querySelectorAll('.notebook-block')];

        const contentHeight = blocks.reduce((maxHeight, block) => {
            const blockBottom = block.offsetTop + block.offsetHeight + bottomPadding;

            return Math.max(maxHeight, blockBottom);
        }, minHeight);

        canvas.style.minHeight = `${contentHeight}px`;
    };

    const resizeObserver = new ResizeObserver(() => {
        updateCanvasHeight();
    });

    const observeBlock = (block) => {
        resizeObserver.observe(block);
    };

    const {
        selectBlock,
        clearSelection,
    } = createNotebookSelection(state);

    async function saveBlock(block) {
        const contentEl = block.querySelector('[data-content]');
        const currentPosition = readPosition(block);
        const content = normalizeText(contentEl.textContent || '');
    
        const freePosition = findFreePosition(
            block,
            currentPosition.x,
            currentPosition.y,
            canvas
        );
    
        if (
            freePosition.x !== currentPosition.x ||
            freePosition.y !== currentPosition.y
        ) {
            setPosition(block, freePosition.x, freePosition.y, canvas);
        }
    
        const finalPosition = readPosition(block);
    
        const data = await api.saveBlock({
            id: block.dataset.id,
            content,
            x: finalPosition.x,
            y: finalPosition.y,
        });
    
        contentEl.textContent = data.block.content ?? '';
    }

    async function deleteBlock(block) {
        await api.deleteBlock(block.dataset.id);

        resizeObserver.unobserve(block);
        block.remove();
        updateCanvasHeight();

        if (state.selectedBlock === block) {
            state.selectedBlock = null;
        }

        if (state.editingBlock === block) {
            state.editingBlock = null;
        }

        if (state.dragState?.block === block) {
            state.dragState = null;
        }
    }

    const {
        startEditing,
        finishEditing,
        cancelEditing,
    } = createNotebookEditing({
        state,
        selectBlock,
        clearSelection,
        saveBlock,
        deleteBlock,
    });

    const {
        bindBlockDrag,
    } = createNotebookDrag({
        canvas,
        state,
        selectBlock,
        saveBlock,
    });

    const {
        bindBlock,
    } = createNotebookBlockEvents({
        state,
        selectBlock,
        startEditing,
        finishEditing,
        cancelEditing,
        deleteBlock,
        bindBlockDrag,
    });

    const {
        createBlock,
    } = createNotebookCreation({
        canvas,
        api,
        bindBlock,
        selectBlock,
        startEditing,
    });

    canvas.addEventListener('input', (event) => {
        if (!event.target.closest('.notebook-block')) {
            return;
        }

        updateCanvasHeight();
    });

    window.addEventListener('resize', () => {
        updateCanvasHeight();
    });

    canvas.addEventListener('click', (event) => {
        const clickedBlock = event.target.closest('.notebook-block');

        if (clickedBlock || state.editingBlock) {
            return;
        }

        clearSelection();
    });

    canvas.addEventListener('dblclick', (event) => {
        const clickedBlock = event.target.closest('.notebook-block');

        if (clickedBlock || state.editingBlock) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        clearNativeSelection();
        clearSelection();

        const rect = canvas.getBoundingClientRect();

        createBlock(
            event.clientX - rect.left,
            event.clientY - rect.top,
        )
            .then((block) => {
                if (block) {
                    observeBlock(block);
                }

                updateCanvasHeight();
            })
            .catch((error) => {
                console.error('Не удалось создать блок:', error);
            });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Delete' && state.selectedBlock && state.editingBlock !== state.selectedBlock) {
            deleteBlock(state.selectedBlock).catch((error) => {
                console.error('Не удалось удалить блок:', error);
            });
            return;
        }

        if (event.key === 'Enter' && state.selectedBlock && state.editingBlock !== state.selectedBlock) {
            event.preventDefault();
            startEditing(state.selectedBlock);
            return;
        }

        if (event.key === 'Escape' && state.selectedBlock && !state.editingBlock) {
            event.preventDefault();
            clearSelection();
        }
    });

    document.addEventListener('click', (event) => {
        if (root.contains(event.target)) {
            return;
        }

        if (state.editingBlock) {
            finishEditing(state.editingBlock, { clearSelectionAfter: true }).catch(console.error);
            return;
        }

        if (state.selectedBlock) {
            clearSelection();
        }
    });

    canvas.querySelectorAll('.notebook-block').forEach((block) => {
        const { x, y } = readPosition(block);

        setPosition(block, x, y, canvas);
        bindBlock(block);
        observeBlock(block);
    });

    updateCanvasHeight();
}

document.addEventListener('DOMContentLoaded', () => {
    initNotebookPage();
});