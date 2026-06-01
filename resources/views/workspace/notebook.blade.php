@extends('layouts.workspace')

@section('title', 'Workspace - Notebook')

@section('content')
<div
    class="notebook-page"
    data-sheet-id="{{ $activeSheet->id }}"
    data-store-url="{{ route('notebook.blocks.store') }}"
    data-update-url-template="{{ route('notebook.blocks.update', ['id' => '__ID__']) }}"
    data-destroy-url-template="{{ route('notebook.blocks.destroy', ['id' => '__ID__']) }}"
>
    <div class="week-toolbar">
        <div class="week-toolbar__nav notebook-toolbar__nav" aria-label="Навигация по notebook">
            <div class="week-toolbar__range">
                Notebook
            </div>

            <div class="notebook-sheets" aria-label="Листы notebook">
                @foreach ($sheets as $sheet)
                    <div class="notebook-sheets__item {{ $activeSheet->id === $sheet->id ? 'is-active' : '' }}">
                        <a
                            href="{{ route('workspace.notebook', ['sheet' => $sheet->id]) }}"
                            class="notebook-sheets__link"
                            aria-current="{{ $activeSheet->id === $sheet->id ? 'page' : 'false' }}"
                        >
                            {{ $sheet->display_order }}
                        </a>

                        @if ($activeSheet->id === $sheet->id && $sheets->count() > 1)
                            <form
                                method="POST"
                                action="{{ route('workspace.notebook.sheets.destroy', $sheet->id) }}"
                                class="notebook-sheets__delete-form"
                            >
                                @csrf
                                @method('DELETE')

                                <button
                                    type="submit"
                                    class="notebook-sheets__delete"
                                    aria-label="Удалить лист {{ $sheet->display_order }}"
                                >
                                    ×
                                </button>
                            </form>
                        @endif
                    </div>
                @endforeach

                <form
                    method="POST"
                    action="{{ route('workspace.notebook.sheets.store') }}"
                    class="notebook-sheets__create-form"
                >
                    @csrf
                    <button type="submit" class="notebook-sheets__create" aria-label="Создать новый лист">
                        +
                    </button>
                </form>
            </div>
        </div>

        @include('workspace.partials.workspace-actions', [
        'activeMode' => 'notebook',
        'notebookUrl' => route('workspace.notebook', ['sheet' => $activeSheet->id]),
    ])
    </div>

    <section class="notebook-canvas" data-canvas>
        @foreach ($blocks as $block)
            <article
                class="notebook-block"
                data-id="{{ $block->id }}"
                data-state="created"
                data-editing="false"
                style="left: {{ $block->x }}px; top: {{ $block->y }}px;"
            >
                <div class="notebook-block__content" data-content>{{ $block->content }}</div>
            </article>
        @endforeach
    </section>
</div>
@endsection