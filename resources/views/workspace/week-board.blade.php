@extends('layouts.workspace')

@section('title', 'Workspace - Неделя')

@section('content')
<div class="week-page">
    <div class="week-toolbar">
        <div class="week-toolbar__nav" aria-label="Навигация по неделе">
            <a
                href="{{ route('workspace.week', ['date' => $startOfWeek->copy()->subWeek()->toDateString()]) }}"
                class="week-toolbar__arrow"
                aria-label="Предыдущая неделя"
            >
                ←
            </a>

            <div class="week-toolbar__range">
                {{ $startOfWeek->translatedFormat('d M') }} -
                {{ $endOfWeek->translatedFormat('d M') }}
            </div>

            <a
                href="{{ route('workspace.week', ['date' => $startOfWeek->copy()->addWeek()->toDateString()]) }}"
                class="week-toolbar__arrow"
                aria-label="Следующая неделя"
            >
                →
            </a>

            <a
                href="{{ route('workspace.week') }}"
                class="week-toolbar__today"
            >
                Сегодня
            </a>
        </div>

        @include('workspace.partials.workspace-actions', [
        'activeMode' => 'week',
            ])
    </div>

    <div class="week-board" data-reorder-url="{{ route('tasks.reorder') }}">
        @foreach ($days as $day)
            <section class="week-column" data-date="{{ $day['date'] }}">
                <div class="week-column__header">
                    {{ $day['day_name'] ?? $day['label'] ?? $day['date'] }}
                </div>

                <div class="week-column__content" data-empty-message="На этот день карточек нет.">
                    @forelse ($day['tasks'] as $task)
                    @include('workspace.partials.task-card', [
                                    'task' => $task,
                                    'showDoneToggle' => true,
                                ])
                    @empty
                        <div class="week-column__empty" data-empty-state>
                            На этот день карточек нет.
                        </div>
                    @endforelse
                </div>

                <button
                    type="button"
                    class="week-column__add"
                    data-date="{{ $day['date'] }}"
                >
                    + Добавить карточку
                </button>
            </section>
        @endforeach
    </div>
</div>

@include('workspace.partials.task-form-modal')
@include('workspace.partials.task-view-modal')
@endsection