<div class="{{ $actionsClass ?? 'week-toolbar__actions' }}">
    <nav class="week-mode-switch" aria-label="Переключение режимов Workspace">
        <a
            href="{{ route('workspace.month') }}"
            class="week-mode-switch__link {{ $activeMode === 'month' ? 'is-active' : '' }}"
            @if ($activeMode === 'month') aria-current="page" @endif
        >
            Месяц
        </a>

        <a
            href="{{ route('workspace.week') }}"
            class="week-mode-switch__link {{ $activeMode === 'week' ? 'is-active' : '' }}"
            @if ($activeMode === 'week') aria-current="page" @endif
        >
            Неделя
        </a>

        <a
            href="{{ $notebookUrl ?? route('workspace.notebook') }}"
            class="week-mode-switch__link {{ $activeMode === 'notebook' ? 'is-active' : '' }}"
            @if ($activeMode === 'notebook') aria-current="page" @endif
        >
            Notebook
        </a>
    </nav>

    <div class="profile-dropdown {{ $profileDropdownClass ?? 'week-profile-dropdown' }}">
        <button type="button" id="profileBtn" class="btn btn-profile">
            Профиль ▼
        </button>

        <div id="profileMenu" class="dropdown-menu">
            <a href="{{ route('profile.settings') }}">Настройки профиля</a>

            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit">Выйти</button>
            </form>
        </div>
    </div>
</div>