<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Workspace</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @vite(['resources/css/app.css'])

</head>
<body class="welcome-body">
    <main class="welcome-screen">
        <div class="welcome-screen__inner">
            <h1 class="welcome-screen__title">Workspace</h1>

            <a href="{{ route('login') }}" class="welcome-screen__action">
                Войти
            </a>
            <a href="{{ route('register') }}" class="welcome-screen__action">
                Зарегистрироваться
            </a>
        </div>
    </main>
</body>
</html>