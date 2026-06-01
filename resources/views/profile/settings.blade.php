@extends('layouts.workspace')

@section('title', 'Профиль')

@section('content')
<div class="profile-page">
    <div class="profile-page__inner">
        <div class="profile-page__header">
            <a href="{{ route('workspace.month') }}" class="profile-page__back-link">
                <span aria-hidden="true">←</span>
                <span>Вернуться в Workspace</span>
            </a>

            <div class="profile-page__heading">
                <h1 class="profile-page__title">Профиль</h1>
                <p class="profile-page__subtitle">Управление данными аккаунта, паролем и доступом к аккаунту.</p>
            </div>
        </div>

        <div class="profile-sections">
            <section class="profile-card">
                <div class="profile-card__header">
                    <h2 class="profile-card__title">Данные профиля</h2>
                </div>

                <div class="profile-card__body">
                    @if (session('status') === 'profile-updated')
                        <div class="profile-message profile-message--success">
                            Данные профиля успешно обновлены.
                        </div>
                    @endif

                    <form method="POST" action="{{ route('profile.update') }}" class="profile-form">
                        @csrf
                        @method('PATCH')

                        <div class="profile-form__group">
                            <label for="name" class="profile-form__label">Имя</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value="{{ old('name', $user->name) }}"
                                class="profile-form__input @error('name') is-invalid @enderror"
                                required
                                autocomplete="name"
                                autofocus
                            >

                            @error('name')
                                <p class="profile-form__error">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="profile-form__group">
                            <label for="email" class="profile-form__label">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value="{{ old('email', $user->email) }}"
                                class="profile-form__input @error('email') is-invalid @enderror"
                                required
                                autocomplete="email"
                            >

                            @error('email')
                                <p class="profile-form__error">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="profile-form__actions">
                            <button type="submit" class="profile-button profile-button--primary">
                                Сохранить изменения
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section class="profile-card">
                <div class="profile-card__header">
                    <h2 class="profile-card__title">Смена пароля</h2>
                </div>

                <div class="profile-card__body">
                    @if (session('status') === 'password-updated')
                        <div class="profile-message profile-message--success">
                            Пароль успешно изменён.
                        </div>
                    @endif

                    @if ($errors->updatePassword->any())
                        <div class="profile-message profile-message--error">
                            <ul class="profile-message__list">
                                @foreach ($errors->updatePassword->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form method="POST" action="{{ route('password.update') }}" class="profile-form">
                        @csrf
                        @method('PUT')

                        <div class="profile-form__group">
                            <label for="current_password" class="profile-form__label">Текущий пароль</label>
                            <input
                                id="current_password"
                                type="password"
                                name="current_password"
                                class="profile-form__input @error('current_password', 'updatePassword') is-invalid @enderror"
                                required
                                autocomplete="current-password"
                            >

                            @error('current_password', 'updatePassword')
                                <p class="profile-form__error">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="profile-form__group">
                            <label for="password" class="profile-form__label">Новый пароль</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                class="profile-form__input @error('password', 'updatePassword') is-invalid @enderror"
                                required
                                autocomplete="new-password"
                            >

                            <p class="profile-form__help">
                                Пароль должен быть не короче 8 символов
                            </p>

                            @error('password', 'updatePassword')
                                <p class="profile-form__error">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="profile-form__group">
                            <label for="password_confirmation" class="profile-form__label">Подтвердите новый пароль</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                class="profile-form__input"
                                required
                                autocomplete="new-password"
                            >
                        </div>

                        <div class="profile-form__actions">
                            <button type="submit" class="profile-button profile-button--success">
                                Сменить пароль
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section class="profile-card profile-card--danger">
                <div class="profile-card__header">
                    <h2 class="profile-card__title">Удаление аккаунта</h2>
                </div>

                <div class="profile-card__body">
                    <p class="profile-form__help">
                        Это действие удалит ваш аккаунт.
                    </p>

                    <form method="POST" action="{{ route('profile.destroy') }}" class="profile-form">
                        @csrf
                        @method('DELETE')

                        <div class="profile-form__group">
                            <label for="delete_password" class="profile-form__label">Подтвердите пароль</label>
                            <input
                                id="delete_password"
                                type="password"
                                name="password"
                                class="profile-form__input @error('password') is-invalid @enderror"
                                required
                                autocomplete="current-password"
                            >

                            @error('password')
                                <p class="profile-form__error">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="profile-form__actions">
                            <button type="submit" class="profile-button profile-button--danger">
                                Удалить аккаунт
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    </div>
</div>
@endsection