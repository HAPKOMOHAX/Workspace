import { initCardDnD } from '../cards/card-dnd';

export function initWeekBoardDnD() {
    const root = document.querySelector('.week-board');

    if (!root) {
        return;
    }

    initCardDnD({
        root,
        reorderUrl: root.dataset.reorderUrl,
        columnSelector: '.week-column',
        contentSelector: '.week-column__content',
        cardSelector: '.task-card',
    });
}
