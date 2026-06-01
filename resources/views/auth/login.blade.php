<x-guest-layout>
    @section('title', 'Вход')

    <h1 class="auth-page__title">Вход</h1>

    @if (session('status'))
        <div class="auth-message auth-message--success">
            {{ session('status') }}
        </div>
    @endif

    @if ($errors->any())
        <div class="auth-message auth-message--error">
            <ul class="auth-message__list">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}" class="auth-form">
        @csrf

        <div class="auth-form__group">
            <label for="email" class="auth-form__label">Электронная почта</label>
            <input
                id="email"
                class="auth-form__input"
                type="email"
                name="email"
                value="{{ old('email') }}"
                required
                autofocus
                autocomplete="username"
            >
        </div>

        <div class="auth-form__group">
            <label for="password" class="auth-form__label">Пароль</label>
            <input
                id="password"
                class="auth-form__input"
                type="password"
                name="password"
                required
                autocomplete="current-password"
            >
        </div>

        <div class="auth-form__row">
            <label for="remember_me" class="auth-checkbox">
                <input id="remember_me" type="checkbox" name="remember">
                <span>Запомнить меня</span>
            </label>

            @if (Route::has('password.request'))
                <a href="{{ route('password.request') }}" class="auth-link">
                    Восстановить пароль
                </a>
            @endif
        </div>

        <button type="submit" class="auth-button">
            Войти
        </button>
    </form>
</x-guest-layout>