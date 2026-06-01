import { requestDocument } from '../shared/http';




export async function replaceFragment({ currentSelector, sourceSelector = currentSelector }) {
    const currentNode = document.querySelector(currentSelector);

    if (!currentNode) {
        return false;
    }

    const doc = await requestDocument();
    const nextNode = doc.querySelector(sourceSelector);

    if (!nextNode) {
        throw new Error(`Во входящем HTML не найден фрагмент ${sourceSelector}`);
    }

    currentNode.replaceWith(nextNode);
    return true;
}