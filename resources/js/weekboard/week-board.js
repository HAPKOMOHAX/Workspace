import { initWeekBoardDnD } from './week-board-dnd';
import { onCardsChanged, emitCardsChanged } from '../cards/card-events';
import { readCardFromElement } from '../cards/card-dom';
import { replaceFragment } from '../cards/card-view-refresh';
import { saveCard } from '../cards/card-api';

function hasCards(column) {
    return Boolean(column?.querySelector('.task-card'));
}

function removeEmptyState(column) {
    column?.querySelector('.week-column__empty')?.remove();
}

function restoreEmptyState(column) {
    if (!column || hasCards(column)) {
        return;
    }

    const content = column.querySelector('.week-column__content');

    if (!content || content.querySelector('.week-column__empty')) {
        return;
    }

    const emptyState = document.createElement('div');

    emptyState.className = 'week-column__empty';
    emptyState.textContent = 'На этот день карточек нет.';

    content.prepend(emptyState);
}

function closeOpenComposers(board) {
    board.querySelectorAll('.week-card-composer').forEach((composer) => {
        const column = composer.closest('.week-column');
        const addButton = column?.querySelector('.week-column__add');

        composer.remove();

        if (addButton) {
            addButton.hidden = false;
        }

        restoreEmptyState(column);
    });
}

function createComposerElement(dateStr) {
    const composer = document.createElement('form');

    composer.className = 'week-card-composer';
    composer.dataset.date = dateStr;

    composer.innerHTML = `
        <textarea
            class="week-card-composer__input"
            name="title"
            rows="2"
            placeholder="Введите название карточки"
            maxlength="255"
        ></textarea>

        <div class="week-card-composer__actions">
            <button type="submit" class="week-card-composer__submit">
                Добавить
            </button>

            <button type="button" class="week-card-composer__cancel" aria-label="Отменить создание">
                ×
            </button>
        </div>
    `;

    return composer;
}

function openCardComposer({ board, column, button }) {
    const dateStr = button.dataset.date;

    if (!dateStr) {
        return;
    }

    closeOpenComposers(board);

    const content = column.querySelector('.week-column__content');

    if (!content) {
        return;
    }

    const composer = createComposerElement(dateStr);
    const input = composer.querySelector('.week-card-composer__input');
    const cancelButton = composer.querySelector('.week-card-composer__cancel');

    button.hidden = true;
    removeEmptyState(column);
    content.appendChild(composer);

    requestAnimationFrame(() => {
        input?.focus();
    });

    function closeComposer() {
        composer.remove();
        button.hidden = false;
        restoreEmptyState(column);
    }

    cancelButton?.addEventListener('click', closeComposer);

    input?.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeComposer();
            return;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            composer.requestSubmit();
        }
    });

    composer.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = input?.value.trim();

        if (!title) {
            input?.focus();
            return;
        }

        const submitButton = composer.querySelector('.week-card-composer__submit');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Добавляем...';
        }

        try {
            const result = await saveCard({
                payload: {
                    title,
                    description: '',
                    scheduled_for: dateStr,
                    status: 'todo',
                },
            });

            emitCardsChanged({
                type: 'saved',
                task: result.task ?? null,
            });
        } catch (error) {
            console.error('Не удалось создать карточку:', error);

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Добавить';
            }

            input?.focus();
            alert(error.data?.message || error.message || 'Не удалось создать карточку.');
        }
    });
}

function bindTaskCreateButtons(board) {
    const addButtons = board.querySelectorAll('.week-column__add');

    addButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const column = button.closest('.week-column');

            if (!column) {
                return;
            }

            openCardComposer({
                board,
                column,
                button,
            });
        });
    });
}

function buildStatusTogglePayload(card, nextStatus) {
    const task = readCardFromElement(card);

    return {
        title: task.title,
        description: task.description || '',
        scheduled_for: task.scheduled_for,
        status: nextStatus,
    };
}

async function toggleCardDone(card, button) {
    const cardId = card.dataset.id;

    if (!cardId) {
        return;
    }

    const currentStatus = card.dataset.status || 'todo';
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';

    button.disabled = true;
    button.classList.add('is-loading');

    try {
        const result = await saveCard({
            cardId,
            payload: buildStatusTogglePayload(card, nextStatus),
        });

        const savedTask = result.task ?? null;
        const savedStatus = savedTask?.status || nextStatus;
        const isDone = savedStatus === 'done';

        card.dataset.status = savedStatus;
        card.classList.toggle('task-card--done', isDone);

        button.setAttribute(
            'aria-label',
            isDone ? 'Вернуть карточку в работу' : 'Пометить карточку готовой'
        );

        button.setAttribute(
            'title',
            isDone ? 'Вернуть в работу' : 'Готово'
        );
    } catch (error) {
        console.error('Не удалось изменить статус карточки:', error);
        alert(error.data?.message || error.message || 'Не удалось изменить статус карточки.');
    } finally {
        button.disabled = false;
        button.classList.remove('is-loading');
    }
}

function bindCardDoneToggles(board) {
    const toggleButtons = board.querySelectorAll('[data-card-done-toggle]');

    toggleButtons.forEach((button) => {
        button.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });

        button.addEventListener('dragstart', (event) => {
            event.preventDefault();
        });

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const card = button.closest('.task-card');

            if (!card || card.dataset.justDragged === 'true') {
                return;
            }

            toggleCardDone(card, button);
        });
    });
}

function bindTaskCards(board) {
    const taskCards = board.querySelectorAll('.task-card');

    taskCards.forEach((card) => {
        card.addEventListener('click', () => {
            if (card.dataset.justDragged === 'true') {
                return;
            }

            const task = readCardFromElement(card);

            if (window.taskModal?.openTaskViewModal) {
                window.taskModal.openTaskViewModal(task);
            }
        });
    });
}

function mountWeekBoard() {
    const board = document.querySelector('.week-board');

    if (!board) {
        return;
    }

    bindTaskCreateButtons(board);
    bindCardDoneToggles(board);
    bindTaskCards(board);
    initWeekBoardDnD();
}

export function initWeekBoard() {
    mountWeekBoard();

    onCardsChanged(async (event) => {
        const type = event.detail?.type;

        if (type !== 'saved' && type !== 'deleted') {
            return;
        }

        try {
            const replaced = await replaceFragment({
                currentSelector: '.week-board',
            });

            if (replaced) {
                mountWeekBoard();
            }
        } catch (error) {
            console.error('Не удалось обновить week-board без перезагрузки:', error);
            window.location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initWeekBoard();
});