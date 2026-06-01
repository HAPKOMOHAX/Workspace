import { saveCard, deleteCard } from '../cards/card-api';
import { emitCardsChanged } from '../cards/card-events';

export function createTaskModalApi(ctx) {
    function getTaskPayload(overrides = {}) {
        const task = ctx.currentTaskData ?? {};

        return {
            title: task.title ?? '',
            description: task.description ?? task.extendedProps?.description ?? '',
            scheduled_for: task.scheduled_for ?? task.extendedProps?.scheduled_for ?? '',
            status: task.status ?? task.extendedProps?.status ?? 'todo',
            ...overrides,
        };
    }

    function rememberTask(task) {
        if (!task) {
            return;
        }

        ctx.currentTaskId = task.id ?? ctx.currentTaskId;

        ctx.currentTaskData = {
            ...ctx.currentTaskData,
            ...task,
            extendedProps: {
                ...(ctx.currentTaskData?.extendedProps ?? {}),
                description: task.description ?? '',
                scheduled_for: task.scheduled_for ?? '',
                status: task.status ?? 'todo',
                position: task.position ?? ctx.currentTaskData?.extendedProps?.position ?? null,
            },
        };
    }

    async function saveTask() {
        const formData = new FormData(ctx.taskForm);
        const payload = Object.fromEntries(formData.entries());

        try {
            const result = await saveCard({
                cardId: ctx.currentTaskId,
                payload,
            });

            rememberTask(result.task ?? null);

            ctx.showAlert(ctx.formAlert, result.message ?? 'Задача сохранена', 'success');

            setTimeout(() => {
                ctx.closeAllModals();

                emitCardsChanged({
                    type: 'saved',
                    task: result.task ?? null,
                });
            }, 1500);
        } catch (error) {
            console.error('Ошибка при сохранении задачи:', error);

            if (error.status === 422 && error.data?.errors) {
                const errorMessages = Object.values(error.data.errors).flat().join(', ');
                ctx.showAlert(ctx.formAlert, errorMessages || 'Ошибка валидации');
                return;
            }

            ctx.showAlert(
                ctx.formAlert,
                error.data?.message || error.message || 'Произошла ошибка при сохранении'
            );
        }
    }

    async function updateTaskField(field, value, options = {}) {
        const { emitChange = true } = options;

        if (!ctx.currentTaskId) {
            throw new Error('Не удалось определить карточку для обновления.');
        }

        const payload = getTaskPayload({
            [field]: value,
        });

        const result = await saveCard({
            cardId: ctx.currentTaskId,
            payload,
        });

        rememberTask(result.task ?? null);

        if (emitChange) {
            emitCardsChanged({
                type: 'saved',
                task: result.task ?? null,
            });
        }

        return result.task ?? payload;
    }

    async function deleteTaskRequest(taskId) {
        if (!taskId) {
            ctx.showAlert(ctx.viewAlert, 'Не удалось определить задачу для удаления');
            return;
        }

        try {
            const result = await deleteCard(taskId);

            ctx.closeAllModals();

            emitCardsChanged({
                type: 'deleted',
                taskId,
                message: result.message ?? null,
            });
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);

            ctx.showAlert(
                ctx.viewAlert,
                error.data?.message || error.message || 'Произошла ошибка при удалении'
            );
        }
    }

    return {
        saveTask,
        updateTaskField,
        deleteTask: deleteTaskRequest,
    };
}