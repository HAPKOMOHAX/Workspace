import {
    createBlockElement,
    findFreePosition,
    setPosition,
} from './notebook-dom';

export function createNotebookCreation({
    canvas,
    api,
    bindBlock,
    selectBlock,
    startEditing,
}) {
    async function createBlock(x, y) {
        const data = await api.createBlock({
            x,
            y,
            content: '',
        });

        const block = createBlockElement(data.block);
        block.dataset.state = 'creating';

        canvas.appendChild(block);

        const freePosition = findFreePosition(
            block,
            data.block.x,
            data.block.y,
            canvas
        );

        setPosition(block, freePosition.x, freePosition.y, canvas);

        if (freePosition.x !== data.block.x || freePosition.y !== data.block.y) {
            await api.saveBlock({
                id: block.dataset.id,
                content: '',
                x: freePosition.x,
                y: freePosition.y,
            });
        }

        bindBlock(block);
        selectBlock(block);
        startEditing(block);

        return block;
    }

    return {
        createBlock,
    };
}