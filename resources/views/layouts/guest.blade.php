<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Авторизация')</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <main class="auth-page">
        <div class="auth-page__inner">
            {{ $slot }}
        </div>
    </main>
</body>
</html>