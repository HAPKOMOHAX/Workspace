<x-guest-layout>
    @section('title', 'Подтверждение email')

    <h1 class="auth-page__title">Подтверждение email</h1>

    <p class="auth-page__text">
        Перед началом работы подтвердите электронную почту по ссылке, которую мы отправили вам после регистрации.
        Если письмо не пришло, можно запросить новое.
    </p>

    @if (session('status') === 'verification-link-sent')
        <div class="auth-message auth-message--success">
            Новая ссылка для подтверждения уже отправлена.
        </div>
    @endif

    <div class="auth-actions">
        <form method="POST" action="{{ route('verification.send') }}">
            @csrf
            <button type="submit" class="auth-button">
                Отправить письмо повторно
            </button>
        </form>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="auth-link auth-link--button">
                Выйти
            </button>
        </form>
    </div>
</x-guest-layout>