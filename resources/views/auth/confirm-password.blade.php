<x-guest-layout>
    @section('title', 'Подтверждение пароля')

    <h1 class="auth-page__title">Подтверждение пароля</h1>

    <p class="auth-page__text">
        Это защищённая зона. Подтвердите пароль, чтобы продолжить.
    </p>

    @if ($errors->any())
        <div class="auth-message auth-message--error">
            <ul class="auth-message__list">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('password.confirm') }}" class="auth-form">
        @csrf

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

        <button type="submit" class="auth-button">
            Подтвердить
        </button>
    </form>
</x-guest-layout>