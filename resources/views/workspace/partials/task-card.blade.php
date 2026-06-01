@php
    $status = $task->status ?? 'todo';
    $isDone = $status === 'done';
    $showDoneToggle = $showDoneToggle ?? false;
@endphp

<article
    class="task-card {{ $isDone ? 'task-card--done' : '' }}"
    draggable="true"
    data-id="{{ $task->id }}"
    data-title="{{ $task->title }}"
    data-description="{{ $task->description }}"
    data-scheduled-for="{{ $task->scheduled_for?->format('Y-m-d') }}"
    data-status="{{ $status }}"
    data-position="{{ $task->position }}"
>
    @if ($showDoneToggle)
        <button
            type="button"
            class="task-card__done-toggle"
            data-card-done-toggle
            draggable="false"
            aria-label="{{ $isDone ? 'Вернуть карточку в работу' : 'Пометить карточку готовой' }}"
            title="{{ $isDone ? 'Вернуть в работу' : 'Готово' }}"
        >
            <span class="task-card__done-check">✓</span>
        </button>
    @endif

    <div class="task-card__title">{{ $task->title }}</div>
</article>