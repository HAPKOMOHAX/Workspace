import { initCardDnD } from '../cards/card-dnd';

export function initMonthViewDnD() {
    const root = document.querySelector('.month-view');

    if (!root) {
        return;
    }

    initCardDnD({
        root,
        reorderUrl: root.dataset.reorderUrl,
        columnSelector: '.month-day',
        contentSelector: '.month-day__content',
        cardSelector: '.task-card',
    });
}