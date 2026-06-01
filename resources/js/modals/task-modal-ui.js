export function initTaskModalUI(ctx, api) {
    const MODAL_ANIMATION_MS = 300;

    function getById(id) {
        return document.getElementById(id);
    }

    function showModal(modal) {
        if (!modal) return;

        modal.style.display = 'block';

        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    function showAlert(alertElement, message, type = 'error') {
        if (!alertElement) return;

        alertElement.textContent = message;
        alertElement.className = `alert alert-${type}`;
        alertElement.hidden = false;
    }

    function hideAlert(alertElement) {
        if (!alertElement) return;

        alertElement.hidden = true;
        alertElement.textContent = '';
        alertElement.className = 'alert';
    }

    function setFieldValue(id, value) {
        const element = getById(id);
        if (!element) return;

        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
            return;
        }

        element.value = value ?? '';
    }

    function setTextValue(id, value) {
        const element = getById(id);
        if (!element) return;

        element.textContent = value ?? '';
    }

    function normalizeDateValue(value) {
        if (!value) return '';
        return String(value).slice(0, 10);
    }

    function formatDate(value) {
        if (!value) return 'Без даты';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function getTaskDescription(task) {
        return task.description ?? task.extendedProps?.description ?? '';
    }

    function getTaskScheduledFor(task) {
        return task.scheduled_for ?? task.extendedProps?.scheduled_for ?? '';
    }

    function getTaskStatus(task) {
        return task.status ?? task.extendedProps?.status ?? 'todo';
    }

    function resetTaskForm() {
        ctx.taskForm.reset();
    }

    function fillTaskForm(task) {
        setFieldValue('title', task.title ?? '');
        setFieldValue('description', getTaskDescription(task));
        setFieldValue('scheduled_for', normalizeDateValue(getTaskScheduledFor(task)));
        setFieldValue('status', getTaskStatus(task));
    }

    function updateCurrentTaskField(field, value) {
        if (!ctx.currentTaskData) {
            ctx.currentTaskData = {};
        }

        ctx.currentTaskData = {
            ...ctx.currentTaskData,
            [field]: value,
            extendedProps: {
                ...(ctx.currentTaskData.extendedProps ?? {}),
                [field]: value,
            },
        };
    }

    function syncVisibleTaskCards(task) {
        if (!task?.id) {
            return;
        }

        const cards = document.querySelectorAll(`.task-card[data-id="${task.id}"]`);

        cards.forEach((card) => {
            const title = task.title ?? '';
            const description = task.description ?? '';
            const scheduledFor = task.scheduled_for ?? '';
            const status = task.status ?? 'todo';

            card.dataset.title = title;
            card.dataset.description = description;
            card.dataset.scheduledFor = scheduledFor;
            card.dataset.status = status;

            card.classList.toggle('task-card--done', status === 'done');

            const titleElement = card.querySelector('.task-card__title');

            if (titleElement) {
                titleElement.textContent = title;
            }

            const toggle = card.querySelector('[data-card-done-toggle]');

            if (toggle) {
                toggle.setAttribute(
                    'aria-label',
                    status === 'done'
                        ? 'Вернуть карточку в работу'
                        : 'Пометить карточку готовой'
                );

                toggle.setAttribute(
                    'title',
                    status === 'done' ? 'Вернуть в работу' : 'Готово'
                );
            }
        });
    }

    function updateStatusView(status) {
        if (!ctx.viewStatusToggle) {
            return;
        }

        const isDone = status === 'done';

        ctx.viewStatusToggle.classList.toggle('is-done', isDone);

        ctx.viewStatusToggle.setAttribute(
            'aria-label',
            isDone ? 'Вернуть карточку в работу' : 'Пометить карточку готовой'
        );

        ctx.viewStatusToggle.setAttribute(
            'title',
            isDone ? 'Вернуть в работу' : 'Готово'
        );

        const titleElement = getById('viewTitle');

        if (titleElement) {
            titleElement.classList.toggle('is-done', isDone);
        }
    }

    function fillTaskView(task) {
        const description = getTaskDescription(task);
        const scheduledFor = getTaskScheduledFor(task);
        const status = getTaskStatus(task);

        setTextValue('viewTitle', task.title ?? 'Без названия');
        setTextValue('viewDescription', description || 'Без описания');
        setTextValue('viewScheduledFor', formatDate(scheduledFor));
        updateStatusView(status);
    }

    function getEditableRawValue(field) {
        const task = ctx.currentTaskData ?? {};

        if (field === 'title') {
            return task.title ?? '';
        }

        if (field === 'description') {
            return getTaskDescription(task);
        }

        return '';
    }

    function getEditableDisplayValue(field, value) {
        if (field === 'title') {
            return value || 'Без названия';
        }

        if (field === 'description') {
            return value || 'Без описания';
        }

        return value ?? '';
    }

    function createInlineEditor(fieldElement, field, value) {
        const isMultiline = fieldElement.dataset.multiline === 'true';
        const editor = document.createElement(isMultiline ? 'textarea' : 'input');

        editor.className = isMultiline
            ? 'modal-task-inline-editor modal-task-inline-editor--textarea'
            : 'modal-task-inline-editor';

        if (!isMultiline) {
            editor.type = 'text';
        }

        editor.value = value ?? '';
        editor.rows = isMultiline ? 4 : undefined;

        return editor;
    }

    function startInlineEdit(fieldElement) {
        if (!fieldElement || fieldElement.classList.contains('is-editing')) {
            return;
        }

        const field = fieldElement.dataset.editableField;

        if (!field) {
            return;
        }

        const previousValue = getEditableRawValue(field);
        const editor = createInlineEditor(fieldElement, field, previousValue);

        let finished = false;

        async function finishEdit({ shouldSave = true } = {}) {
            if (finished) {
                return;
            }

            finished = true;

            const nextValue = editor.value.trim();

            fieldElement.classList.remove('is-editing');
            fieldElement.textContent = getEditableDisplayValue(field, nextValue);

            if (!shouldSave || nextValue === previousValue) {
                return;
            }

            if (field === 'title' && !nextValue) {
                fieldElement.textContent = getEditableDisplayValue(field, previousValue);
                showAlert(ctx.viewAlert, 'Название карточки не может быть пустым');
                return;
            }

            fieldElement.classList.add('is-saving');
            hideAlert(ctx.viewAlert);

            try {
                const savedTask = await api.updateTaskField(field, nextValue);
                const savedValue = savedTask[field] ?? nextValue;

                updateCurrentTaskField(field, savedValue);
                fillTaskView(ctx.currentTaskData);
                syncVisibleTaskCards(ctx.currentTaskData);
            } catch (error) {
                console.error('Ошибка при быстром обновлении поля:', error);

                fieldElement.textContent = getEditableDisplayValue(field, previousValue);

                showAlert(
                    ctx.viewAlert,
                    error.data?.message || error.message || 'Не удалось сохранить поле'
                );
            } finally {
                fieldElement.classList.remove('is-saving');
            }
        }

        fieldElement.classList.add('is-editing');
        fieldElement.textContent = '';
        fieldElement.appendChild(editor);

        requestAnimationFrame(() => {
            editor.focus();
            editor.select();
        });

        editor.addEventListener('blur', () => {
            finishEdit();
        });

        editor.addEventListener('keydown', (event) => {
            event.stopPropagation();

            if (event.key === 'Escape') {
                event.preventDefault();
                finishEdit({ shouldSave: false });
                return;
            }

            if (event.key === 'Enter') {
                const isTextarea = editor.tagName === 'TEXTAREA';

                if (isTextarea && event.shiftKey) {
                    return;
                }

                event.preventDefault();
                finishEdit();
            }
        });
    }

    function bindInlineEditableFields() {
        const editableFields = ctx.taskViewModal.querySelectorAll('[data-editable-field]');

        editableFields.forEach((fieldElement) => {
            fieldElement.addEventListener('click', () => {
                startInlineEdit(fieldElement);
            });

            fieldElement.addEventListener('keydown', (event) => {
                if (event.target.closest('.modal-task-inline-editor')) {
                    return;
                }

                if (event.key !== 'Enter') {
                    return;
                }

                event.preventDefault();
                startInlineEdit(fieldElement);
            });
        });
    }

    async function toggleTaskStatus() {
        if (!ctx.currentTaskId || !ctx.viewStatusToggle) {
            return;
        }

        const currentStatus = getTaskStatus(ctx.currentTaskData ?? {});
        const nextStatus = currentStatus === 'done' ? 'todo' : 'done';

        ctx.viewStatusToggle.disabled = true;
        ctx.viewStatusToggle.classList.add('is-loading');
        hideAlert(ctx.viewAlert);

        try {
            const savedTask = await api.updateTaskField('status', nextStatus, {
                emitChange: false,
            });

            const savedStatus = savedTask.status ?? nextStatus;

            updateCurrentTaskField('status', savedStatus);
            fillTaskView(ctx.currentTaskData);
            syncVisibleTaskCards(ctx.currentTaskData);
        } catch (error) {
            console.error('Ошибка при обновлении статуса карточки:', error);

            showAlert(
                ctx.viewAlert,
                error.data?.message || error.message || 'Не удалось обновить статус'
            );
        } finally {
            ctx.viewStatusToggle.disabled = false;
            ctx.viewStatusToggle.classList.remove('is-loading');
        }
    }

    function openTaskFormModal(dateStr = null, task = null) {
        resetTaskForm();
        hideAlert(ctx.formAlert);

        if (task) {
            ctx.currentTaskId = task.id ?? null;
            ctx.currentTaskData = task ?? null;

            if (ctx.taskFormTitle) {
                ctx.taskFormTitle.textContent = 'Редактировать задачу';
            }

            fillTaskForm(task);
        } else {
            ctx.currentTaskId = null;
            ctx.currentTaskData = null;

            if (ctx.taskFormTitle) {
                ctx.taskFormTitle.textContent = 'Создать задачу';
            }

            setFieldValue('scheduled_for', normalizeDateValue(dateStr));
            setFieldValue('status', 'todo');
        }

        showModal(ctx.taskFormModal);
    }

    function openTaskViewModal(task) {
        ctx.currentTaskId = task?.id ?? null;
        ctx.currentTaskData = task ?? null;

        fillTaskView(task ?? {});
        hideAlert(ctx.viewAlert);
        showModal(ctx.taskViewModal);
    }

    function closeAllModals() {
        ctx.taskFormModal.classList.remove('show');
        ctx.taskViewModal.classList.remove('show');
        hideAlert(ctx.formAlert);
        hideAlert(ctx.viewAlert);

        setTimeout(() => {
            ctx.taskFormModal.style.display = 'none';
            ctx.taskViewModal.style.display = 'none';
            ctx.currentTaskId = null;
            ctx.currentTaskData = null;
        }, MODAL_ANIMATION_MS);
    }

    ctx.showAlert = showAlert;
    ctx.hideAlert = hideAlert;
    ctx.closeAllModals = closeAllModals;

    ctx.closeButtons.forEach((button) => {
        button.addEventListener('click', closeAllModals);
    });

    ctx.cancelTaskForm?.addEventListener('click', closeAllModals);
    ctx.closeTaskView?.addEventListener('click', closeAllModals);

    ctx.taskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        api.saveTask();
    });

    ctx.deleteTaskButton?.addEventListener('click', function () {
        if (confirm('Вы уверены, что хотите удалить карточку?')) {
            api.deleteTask(ctx.currentTaskId);
        }
    });

    ctx.viewStatusToggle?.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleTaskStatus();
    });

    window.addEventListener('click', function (event) {
        if (event.target === ctx.taskFormModal || event.target === ctx.taskViewModal) {
            closeAllModals();
        }
    });

    bindInlineEditableFields();

    return {
        openTaskFormModal,
        openTaskViewModal,
    };
}