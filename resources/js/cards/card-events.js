const CARDS_CHANGED_EVENT = 'cards:changed';

export function emitCardsChanged(detail = {}) {
    document.dispatchEvent(new CustomEvent(CARDS_CHANGED_EVENT, { detail }));
}

export function onCardsChanged(handler) {
    document.addEventListener(CARDS_CHANGED_EVENT, handler);
}

export function offCardsChanged(handler) {
    document.removeEventListener(CARDS_CHANGED_EVENT, handler);
}