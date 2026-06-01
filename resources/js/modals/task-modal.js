import { createTaskModalApi } from './task-modal-api';
import { initTaskModalUI } from './task-modal-ui';

document.addEventListener('DOMContentLoaded', function () {
    const getById = (id) => document.getElementById(id);

    const ctx = {
        taskFormModal: getById('taskFormModal'),
        taskViewModal: getById('taskViewModal'),
        taskFormTitle: getById('taskFormTitle'),
        taskForm: getById('taskForm'),

        closeButtons: document.querySelectorAll('.modal-close'),
        cancelTaskForm: getById('cancelTaskForm'),
        closeTaskView: getById('closeTaskView'),
        editTaskButton: getById('editTaskButton'),
        deleteTaskButton: getById('deleteTaskButton'),
        viewStatusToggle: getById('viewStatusToggle'),
        
        formAlert: getById('formAlert'),
        viewAlert: getById('viewAlert'),

        currentTaskId: null,
        currentTaskData: null,
      

        showAlert: () => {},
        hideAlert: () => {},
        closeAllModals: () => {}
    };

    if (!ctx.taskFormModal || !ctx.taskViewModal || !ctx.taskForm) {
        return;
    }

    const api = createTaskModalApi(ctx);
    const modalPublicApi = initTaskModalUI(ctx, api);

    window.taskModal = modalPublicApi;
});