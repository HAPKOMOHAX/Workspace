<div id="taskViewModal" class="modal">
    <div class="modal-content modal-task-card">
        <div class="modal-task-topbar">
            <div class="modal-task-date-badge" id="viewScheduledFor">
                Не указано
            </div>

            <div class="modal-task-actions">
                <button
                    type="button"
                    class="modal-task-icon-button modal-task-icon-button--danger"
                    id="deleteTaskButton"
                    aria-label="Удалить карточку"
                    title="Удалить карточку"
                >
                🗑
                </button>

                <button
                    type="button"
                    class="modal-close modal-task-icon-button"
                    aria-label="Закрыть"
                    title="Закрыть"
                >
                <svg
        class="modal-task-close-icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
    >
        <path d="M4 4L12 12M12 4L4 12" />
    </svg>
                </button>
            </div>
        </div>

        <div class="modal-body modal-task-body">
            <div id="viewAlert" class="alert" hidden></div>

            <div class="modal-task-title-row">
                <button
                    type="button"
                    class="modal-task-status-toggle"
                    id="viewStatusToggle"
                    aria-label="Пометить карточку готовой"
                    title="Готово"
                >
                    <span class="modal-task-status-check">✓</span>
                </button>

                <div
                    class="modal-task-title modal-task-editable"
                    id="viewTitle"
                    data-editable-field="title"
                    tabindex="0"
                    role="button"
                    aria-label="Редактировать название"
                ></div>
            </div>

            <div class="modal-task-description-block">
                <div class="modal-task-description-label">Описание</div>

                <div
                    class="modal-task-description modal-task-editable modal-task-editable--description"
                    id="viewDescription"
                    data-editable-field="description"
                    data-multiline="true"
                    tabindex="0"
                    role="button"
                    aria-label="Редактировать описание"
                ></div>
            </div>
        </div>
    </div>
</div>