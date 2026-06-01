<div id="taskFormModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="taskFormTitle">Создать карточку</h3>
            <button type="button" class="modal-close">&times;</button>
        </div>

        <form id="taskForm">
            <div class="modal-body">
                <div id="formAlert" class="alert" hidden></div>
                <div class="form-group">
                    <label class="form-label" for="title">Название карточки</label>
                    <input type="text" class="form-control" id="title" name="title" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="description">Описание</label>
                    <textarea class="form-control" id="description" name="description"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="scheduled_for">День</label>
                    <input type="date" id="scheduled_for" name="scheduled_for" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="status">Статус</label>
                    <select id="status" name="status" class="form-control">
                        <option value="todo">todo</option>
                        <option value="done">done</option>
                    </select>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancelTaskForm">Отмена</button>
                <button type="submit" class="btn btn-primary" id="saveTask">Сохранить</button>
            </div>
        </form>
    </div>
</div>