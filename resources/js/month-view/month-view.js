import { onCardsChanged, emitCardsChanged } from '../cards/card-events';
import { readCardFromElement } from '../cards/card-dom';
import { replaceFragment } from '../cards/card-view-refresh';
import { saveCard } from '../cards/card-api';
import { initMonthViewDnD } from './month-view-dnd';

const VISIBLE_TASKS_LIMIT = 3;
const MODAL_CLOSE_DELAY = 300;

function getMonthRoot() {
    return document.querySelector('.month-view');
}

function getDayModal() {
    const modal = document.getElementById('monthDayModal');

    return {
        modal,
        title: document.getElementById('monthDayModalTitle'),
        meta: document.getElementById('monthDayModalMeta'),
        cards: document.getElementById('monthDayModalCards'),
        empty: document.getElementById('monthDayModalEmpty'),
        add: document.getElementById('monthDayModalAdd'),
        close: document.getElementById('monthDayModalClose'),
    };
}

function formatDayTitle(dateStr) {
    const date = new Date(`${dateStr}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateStr;
    }

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
    });
}

function pluralizeCards(count) {
    const lastDigit = Math.abs(count) % 10;
    const lastTwoDigits = Math.abs(count) % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} карточек`;
    }

    if (lastDigit === 1) {
        return `${count} карточка`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} карточки`;
    }

    return `${count} карточек`;
}

function stopControlClick(event) {
    event.preventDefault();
    event.stopPropagation();
}

function normalizeDayPreviews(root) {
    root.querySelectorAll('.month-day').forEach((day) => {
        const content = day.querySelector('.month-day__content');

        if (!content) {
            return;
        }

        content.querySelector('[data-month-day-more]')?.remove();

        const cards = Array.from(content.querySelectorAll('.task-card'));
        const hiddenCount = Math.max(cards.length - VISIBLE_TASKS_LIMIT, 0);

        cards.forEach((card, index) => {
            const shouldHide = index >= VISIBLE_TASKS_LIMIT;

            card.classList.toggle('task-card--month-hidden', shouldHide);
            card.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
        });

        if (hiddenCount === 0) {
            return;
        }

        const moreButton = document.createElement('button');

        moreButton.type = 'button';
        moreButton.className = 'month-day__more';
        moreButton.dataset.monthDayMore = '';
        moreButton.textContent = `+ ещё ${hiddenCount}`;

        content.appendChild(moreButton);
    });
}

function updateDoneToggleState(toggle, isDone) {
    if (!toggle) {
        return;
    }

    toggle.setAttribute(
        'aria-label',
        isDone ? 'Вернуть карточку в работу' : 'Пометить карточку готовой'
    );

    toggle.setAttribute(
        'title',
        isDone ? 'Вернуть в работу' : 'Готово'
    );
}

function applyStatusToElement(element, status) {
    if (!element) {
        return;
    }

    const isDone = status === 'done';

    element.dataset.status = status;
    element.classList.toggle('task-card--done', isDone);
    element.classList.toggle('month-day-modal__task--done', isDone);

    updateDoneToggleState(
        element.querySelector('[data-card-done-toggle]'),
        isDone
    );
}

function syncStatusEverywhere(taskId, status) {
    if (!taskId) {
        return;
    }

    document
        .querySelectorAll(`.task-card[data-id="${taskId}"]`)
        .forEach((card) => applyStatusToElement(card, status));

    document
        .querySelectorAll(`[data-month-day-modal-task-id="${taskId}"]`)
        .forEach((item) => applyStatusToElement(item, status));
}

function buildStatusPayload(task, nextStatus) {
    return {
        title: task.title,
        description: task.description || '',
        scheduled_for: task.scheduled_for,
        status: nextStatus,
    };
}

async function toggleTaskDone(task, button) {
    if (!task?.id || !button) {
        return;
    }

    const nextStatus = task.status === 'done' ? 'todo' : 'done';

    button.disabled = true;
    button.classList.add('is-loading');

    try {
        const result = await saveCard({
            cardId: task.id,
            payload: buildStatusPayload(task, nextStatus),
        });

        const savedStatus = result.task?.status || nextStatus;

        syncStatusEverywhere(task.id, savedStatus);
    } catch (error) {
        console.error('Не удалось изменить статус карточки:', error);
        alert(error.data?.message || error.message || 'Не удалось изменить статус карточки.');
    } finally {
        button.disabled = false;
        button.classList.remove('is-loading');
    }
}

function createDoneToggle(isDone) {
    const toggle = document.createElement('button');

    toggle.type = 'button';
    toggle.className = 'task-card__done-toggle';
    toggle.dataset.cardDoneToggle = '';
    toggle.draggable = false;

    updateDoneToggleState(toggle, isDone);

    const check = document.createElement('span');

    check.className = 'task-card__done-check';
    check.textContent = '✓';

    toggle.appendChild(check);

    return toggle;
}

function createDayTaskElement(task) {
    const item = document.createElement('div');
    const isDone = task.status === 'done';

    item.className = 'month-day-modal__task';
    item.dataset.monthDayModalTaskId = task.id;
    item.dataset.id = task.id;
    item.dataset.title = task.title || '';
    item.dataset.description = task.description || '';
    item.dataset.scheduledFor = task.scheduled_for || '';
    item.dataset.status = task.status || 'todo';
    item.dataset.position = task.position ?? '';

    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    item.classList.toggle('month-day-modal__task--done', isDone);

    const toggle = createDoneToggle(isDone);

    const title = document.createElement('span');

    title.className = 'month-day-modal__task-title';
    title.textContent = task.title || 'Без названия';

    toggle.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });

    toggle.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    toggle.addEventListener('click', (event) => {
        stopControlClick(event);
        toggleTaskDone(readCardFromElement(item), toggle);
    });

    item.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-done-toggle]')) {
            return;
        }

        openTaskModal(readCardFromElement(item));
    });

    item.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        openTaskModal(readCardFromElement(item));
    });

    item.appendChild(toggle);
    item.appendChild(title);

    return item;
}

function readTasksFromDay(day) {
    return Array
        .from(day.querySelectorAll('.task-card'))
        .map((card) => readCardFromElement(card));
}

function renderDayModalCards(day) {
    const { cards, empty, meta } = getDayModal();

    if (!cards || !empty) {
        return;
    }

    const tasks = readTasksFromDay(day);

    cards.innerHTML = '';

    tasks.forEach((task) => {
        cards.appendChild(createDayTaskElement(task));
    });

    empty.hidden = tasks.length > 0;

    if (meta) {
        meta.textContent = pluralizeCards(tasks.length);
    }
}

function openTaskModal(task) {
    closeDayModal();

    if (window.taskModal?.openTaskViewModal) {
        window.taskModal.openTaskViewModal(task);
    }
}

function openDayModal(day) {
    const { modal, title, add } = getDayModal();

    if (!modal || !title || !add) {
        return;
    }

    modal.dataset.date = day.dataset.date;
    title.textContent = formatDayTitle(day.dataset.date);
    add.hidden = false;

    renderDayModalCards(day);

    modal.style.display = 'block';

    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function closeDayModal() {
    const { modal } = getDayModal();

    if (!modal) {
        return;
    }

    modal.classList.remove('show');

    setTimeout(() => {
        modal.style.display = 'none';
        modal.dataset.date = '';
    }, MODAL_CLOSE_DELAY);
}

function createComposer(dateStr) {
    const composer = document.createElement('form');

    composer.className = 'week-card-composer month-day-composer';
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

function openComposer() {
    const { modal, cards, empty, add } = getDayModal();

    if (!modal || !cards || !add) {
        return;
    }

    const dateStr = modal.dataset.date;

    if (!dateStr) {
        return;
    }

    cards.querySelector('.month-day-composer')?.remove();

    const composer = createComposer(dateStr);
    const input = composer.querySelector('.week-card-composer__input');
    const submit = composer.querySelector('.week-card-composer__submit');
    const cancel = composer.querySelector('.week-card-composer__cancel');

    add.hidden = true;

    if (empty) {
        empty.hidden = true;
    }

    cards.appendChild(composer);

    requestAnimationFrame(() => {
        input?.focus();
    });

    function closeComposer() {
        composer.remove();
        add.hidden = false;

        if (empty) {
            empty.hidden = Boolean(cards.querySelector('.month-day-modal__task'));
        }
    }

    cancel?.addEventListener('click', closeComposer);

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

        if (submit) {
            submit.disabled = true;
            submit.textContent = 'Добавляем...';
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

            closeDayModal();
        } catch (error) {
            console.error('Не удалось создать карточку:', error);

            if (submit) {
                submit.disabled = false;
                submit.textContent = 'Добавить';
            }

            input?.focus();
            alert(error.data?.message || error.message || 'Не удалось создать карточку.');
        }
    });
}

function bindDayClicks(root) {
    if (root.dataset.monthDaysBound === 'true') {
        return;
    }

    root.addEventListener('click', (event) => {
        if (event.target.closest('.task-card')) {
            return;
        }

        const day = event.target.closest('.month-day');

        if (!day || !root.contains(day)) {
            return;
        }

        if (event.target.closest('[data-month-day-more]')) {
            stopControlClick(event);
        }

        openDayModal(day);
    });

    root.dataset.monthDaysBound = 'true';
}

function bindTaskClicks(root) {
    if (root.dataset.monthTaskCardsBound === 'true') {
        return;
    }

    root.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-done-toggle]')) {
            return;
        }

        const card = event.target.closest('.task-card');

        if (!card || !root.contains(card)) {
            return;
        }

        event.stopPropagation();

        if (card.dataset.justDragged === 'true') {
            return;
        }

        openTaskModal(readCardFromElement(card));
    });

    root.dataset.monthTaskCardsBound = 'true';
}

function bindDoneToggles(root) {
    if (root.dataset.monthDoneTogglesBound === 'true') {
        return;
    }

    root.addEventListener('mousedown', (event) => {
        if (event.target.closest('[data-card-done-toggle]')) {
            event.stopPropagation();
        }
    });

    root.addEventListener('dragstart', (event) => {
        if (event.target.closest('[data-card-done-toggle]')) {
            event.preventDefault();
        }
    });

    root.addEventListener('click', (event) => {
        const button = event.target.closest('[data-card-done-toggle]');

        if (!button || !root.contains(button)) {
            return;
        }

        stopControlClick(event);

        const card = button.closest('.task-card');

        if (!card || card.dataset.justDragged === 'true') {
            return;
        }

        toggleTaskDone(readCardFromElement(card), button);
    });

    root.dataset.monthDoneTogglesBound = 'true';
}

function bindDayModal() {
    const { modal, close, add } = getDayModal();

    if (!modal || modal.dataset.bound === 'true') {
        return;
    }

    close?.addEventListener('click', closeDayModal);
    add?.addEventListener('click', openComposer);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeDayModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeDayModal();
        }
    });

    modal.dataset.bound = 'true';
}

function mountMonthView() {
    const root = getMonthRoot();

    if (!root) {
        return;
    }

    normalizeDayPreviews(root);
    bindDayModal();
    bindDayClicks(root);
    bindDoneToggles(root);
    bindTaskClicks(root);
    initMonthViewDnD();
}

async function refreshMonthView() {
    const replaced = await replaceFragment({
        currentSelector: '.month-view',
    });

    if (replaced) {
        mountMonthView();
        return;
    }

    const root = getMonthRoot();

    if (root) {
        normalizeDayPreviews(root);
    }
}

export function initMonthView() {
    mountMonthView();

    onCardsChanged(async (event) => {
        const type = event.detail?.type;

        if (type === 'reordered') {
            requestAnimationFrame(() => {
                const root = getMonthRoot();

                if (root) {
                    normalizeDayPreviews(root);
                }
            });

            return;
        }

        if (type !== 'saved' && type !== 'deleted') {
            return;
        }

        try {
            await refreshMonthView();
        } catch (error) {
            console.error('Не удалось обновить month-view без перезагрузки:', error);
            window.location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMonthView();
});