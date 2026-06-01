<x-guest-layout>
    @section('title', 'Восстановление пароля')

    <h1 class="auth-page__title">Восстановление пароля</h1>

    <p class="auth-page__text">
        Укажите электронную почту, и мы отправим ссылку для сброса пароля.
    </p>

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

    <form method="POST" action="{{ route('password.email') }}" class="auth-form">
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
            >
        </div>

        <button type="submit" class="auth-button">
            Отправить ссылку
        </button>
    </form>
</x-guest-layout>