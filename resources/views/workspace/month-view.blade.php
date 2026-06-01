@extends('layouts.workspace')

@section('title', 'Workspace - Месяц')

@section('content')
<div
    class="month-view"
    data-reorder-url="{{ route('tasks.reorder') }}"
    style="--month-weeks: {{ $weeksCount }};"
>
    <div class="month-toolbar">
        <div class="month-toolbar__nav" aria-label="Навигация по месяцу">
            <a
                href="{{ route('workspace.month', ['month' => $prevMonth]) }}"
                class="month-toolbar__arrow"
                aria-label="Предыдущий месяц"
            >
                ←
            </a>

            <div class="month-toolbar__title">
                {{ $currentMonth->translatedFormat('F Y') }}
            </div>

            <a
                href="{{ route('workspace.month', ['month' => $nextMonth]) }}"
                class="month-toolbar__arrow"
                aria-label="Следующий месяц"
            >
                →
            </a>

            <a
                href="{{ route('workspace.month') }}"
                class="month-toolbar__today"
            >
                Сегодня
            </a>
        </div>

        @include('workspace.partials.workspace-actions', [
        'activeMode' => 'month',
        'actionsClass' => 'month-toolbar__actions',
        'profileDropdownClass' => 'month-profile-dropdown',
    ])
        </div>
    <div class="month-weekdays">
        <div>Понедельник</div>
        <div>Вторник</div>
        <div>Среда</div>
        <div>Четверг</div>
        <div>Пятница</div>
        <div>Суббота</div>
        <div>Воскресенье</div>
    </div>

    <div class="month-grid">
    @foreach ($days as $week)
        @foreach ($week as $day)
            <section
                class="month-day {{ $day['isCurrentMonth'] ? '' : 'month-day--outside' }} {{ $day['isToday'] ? 'month-day--today' : '' }}"
                data-date="{{ $day['date_key'] }}"
            >
                <header class="month-day__header">
                    <span>{{ $day['date']->day }}</span>
                </header>

                <div class="month-day__content">
                    @foreach ($day['tasks'] as $task)
                        @include('workspace.partials.task-card', [
                            'task' => $task,
                            'showDoneToggle' => true,
                        ])
                    @endforeach
                </div>
            </section>
        @endforeach
    @endforeach
</div>
</div>

@include('workspace.partials.task-form-modal')
@include('workspace.partials.task-view-modal')
@include('workspace.partials.month-day-modal')
@endsection