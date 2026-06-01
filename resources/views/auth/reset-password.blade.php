<x-guest-layout>
    @section('title', 'Новый пароль')

    <h1 class="auth-page__title">Новый пароль</h1>

    @if ($errors->any())
        <div class="auth-message auth-message--error">
            <ul class="auth-message__list">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('password.store') }}" class="auth-form">
        @csrf

        <input type="hidden" name="token" value="{{ $request->route('token') }}">

        <div class="auth-form__group">
            <label for="email" class="auth-form__label">Электронная почта</label>
            <input
                id="email"
                class="auth-form__input"
                type="email"
                name="email"
                value="{{ old('email', $request->email) }}"
                required
                autofocus
                autocomplete="username"
            >
        </div>

        <div class="auth-form__group">
            <label for="password" class="auth-form__label">Новый пароль</label>
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

        <button type="submit" class="auth-button">
            Сменить пароль
        </button>
    </form>
</x-guest-layout>