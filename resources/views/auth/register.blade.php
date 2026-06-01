<x-guest-layout>
    @section('title', 'Регистрация')

    <h1 class="auth-page__title">Регистрация</h1>

    @if ($errors->any())
        <div class="auth-message auth-message--error">
            <ul class="auth-message__list">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('register') }}" class="auth-form">
        @csrf

        <div class="auth-form__group">
            <label for="name" class="auth-form__label">Имя</label>
            <input
                id="name"
                class="auth-form__input"
                type="text"
                name="name"
                value="{{ old('name') }}"
                required
                autofocus
                autocomplete="name"
            >
        </div>

        <div class="auth-form__group">
            <label for="email" class="auth-form__label">Электронная почта</label>
            <input
                id="email"
                class="auth-form__input"
                type="email"
                name="email"
                value="{{ old('email') }}"
                required
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
                autocomplete="new-password"
            >
        </div>

        <div class="auth-form__group">
            <label for="password_confirmation" class="auth-form__label">Подтвердите пароль</label>
            <input
                id="password_confirmation"
                class="auth-form__input"
                type="password"
                name="password_confirmation"
                required
                autocomplete="new-password"
            >
        </div>

        <div class="auth-form__row auth-form__row--end">
            <a href="{{ route('login') }}" class="auth-link">
                Уже есть аккаунт?
            </a>
        </div>

        <button type="submit" class="auth-button">
            Зарегистрироваться
        </button>
    </form>
</x-guest-layout>