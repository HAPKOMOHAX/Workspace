import { readPosition, setPosition, getClampedPosition, blockCollides } from './notebook-dom';

export function createNotebookDrag(ctx) {
    const {
        canvas,
        state,
        selectBlock,
        saveBlock,
    } = ctx;

    async function finishDrag(block) {
        if (!state.dragState || state.dragState.block !== block) {
            return;
        }

        const moved = state.dragState.moved;
        const pointerId = state.dragState.pointerId;

        state.dragState = null;

        if (block.hasPointerCapture?.(pointerId)) {
            block.releasePointerCapture(pointerId);
        }

        if (!moved) {
            return;
        }

        try {
            await saveBlock(block);
        } catch (error) {
            console.error('Не удалось сохранить позицию блока:', error);
        }
    }

    function bindBlockDrag(block) {
        block.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;
            if (event.target.closest('.notebook-block__action-btn')) return;
            if (state.editingBlock === block) return;

            selectBlock(block);

            const { x, y } = readPosition(block);

            state.dragState = {
                block,
                pointerId: event.pointerId,
                startClientX: event.clientX,
                startClientY: event.clientY,
                startX: x,
                startY: y,
                lastValidX: x,
                lastValidY: y,
                moved: false,
            };

            block.setPointerCapture(event.pointerId);
        });

        block.addEventListener('pointermove', (event) => {
            if (!state.dragState || state.dragState.block !== block) {
                return;
            }

            if (state.dragState.pointerId !== event.pointerId) {
                return;
            }

            const dx = event.clientX - state.dragState.startClientX;
            const dy = event.clientY - state.dragState.startClientY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                state.dragState.moved = true;
            }

            if (!state.dragState.moved) {
                return;
            }

            const next = getClampedPosition(
                block,
                state.dragState.startX + dx,
                state.dragState.startY + dy,
                canvas
            );
            
            if (blockCollides(block, next.x, next.y, canvas)) {
                setPosition(
                    block,
                    state.dragState.lastValidX,
                    state.dragState.lastValidY,
                    canvas
                );
            
                return;
            }
            
            setPosition(block, next.x, next.y, canvas);
            
            state.dragState.lastValidX = next.x;
            state.dragState.lastValidY = next.y;
        });

        block.addEventListener('pointerup', (event) => {
            if (!state.dragState || state.dragState.block !== block) {
                return;
            }

            if (state.dragState.pointerId !== event.pointerId) {
                return;
            }

            finishDrag(block).catch(console.error);
        });

        block.addEventListener('pointercancel', (event) => {
            if (!state.dragState || state.dragState.block !== block) {
                return;
            }

            if (state.dragState.pointerId !== event.pointerId) {
                return;
            }

            finishDrag(block).catch(console.error);
        });
    }

    return {
        bindBlockDrag,
    };
}