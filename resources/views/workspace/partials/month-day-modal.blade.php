<div id="monthDayModal" class="modal month-day-modal">
    <div class="modal-content month-day-modal__content">
        <div class="month-day-modal__header">
            <div>
                <h3 id="monthDayModalTitle" class="month-day-modal__title">
                    День
                </h3>
                <div id="monthDayModalMeta" class="month-day-modal__meta"></div>
            </div>

            <button
                type="button"
                id="monthDayModalClose"
                class="month-day-modal__close"
                aria-label="Закрыть"
            >
                ×
            </button>
        </div>

        <div class="month-day-modal__body">
            <div id="monthDayModalCards" class="month-day-modal__cards"></div>

            <div id="monthDayModalEmpty" class="month-day-modal__empty" hidden>
                На этот день карточек нет.
            </div>
        </div>

        <div class="month-day-modal__footer">
            <button
                type="button"
                id="monthDayModalAdd"
                class="month-day-modal__add"
            >
                + Добавить карточку
            </button>
        </div>
    </div>
</div>