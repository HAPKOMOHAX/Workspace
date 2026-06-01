export function readCardFromElement(element) {
    return {
        id: element.dataset.id,
        title: element.dataset.title || '',
        description: element.dataset.description || '',
        scheduled_for: element.dataset.scheduledFor || '',
        status: element.dataset.status || 'todo',
        position: element.dataset.position ? Number(element.dataset.position) : null,
        extendedProps: {
            description: element.dataset.description || '',
            scheduled_for: element.dataset.scheduledFor || '',
            status: element.dataset.status || 'todo',
            position: element.dataset.position ? Number(element.dataset.position) : null,
        },
    };
}

export function setCardScheduledFor(element, scheduledFor) {
    element.dataset.scheduledFor = scheduledFor ?? '';
}

export function setCardPosition(element, position) {
    element.dataset.position = position != null ? String(position) : '';
}

export function writeCardToElement(element, card) {
    if (!element || !card) {
        return;
    }

    if (card.id != null) {
        element.dataset.id = String(card.id);
    }

    element.dataset.title = card.title ?? '';
    element.dataset.description = card.description ?? '';
    element.dataset.scheduledFor = card.scheduled_for ?? '';
    element.dataset.status = card.status ?? 'todo';
    element.dataset.position = card.position != null ? String(card.position) : '';

    const titleNode = element.querySelector('.task-card__title, .task-title');
    if (titleNode) {
        titleNode.textContent = card.title ?? '';
    }
}