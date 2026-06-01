import { requestJson } from '../shared/http';

export async function saveCard({ cardId = null, payload }) {
    const url = cardId ? `/tasks/${cardId}` : '/tasks';
    const method = cardId ? 'PUT' : 'POST';

    return requestJson(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function deleteCard(cardId) {
    if (!cardId) {
        throw new Error('Не передан id карточки для удаления.');
    }

    return requestJson(`/tasks/${cardId}`, {
        method: 'DELETE',
    });
}

export async function reorderCards({ reorderUrl, columns }) {
    if (!reorderUrl) {
        throw new Error('Не передан reorderUrl для сохранения порядка карточек.');
    }

    return requestJson(reorderUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ columns }),
    });
}

export async function fetchCards(url = '/tasks/list') {
    return requestJson(url, {
        method: 'GET',
    });
}