<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Workspace')</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    @stack('head')
</head>
<body>
    <div class="workspace-shell">

        <main class="workspace-main">
            @yield('content')
        </main>
    </div>

    @stack('scripts')
</body>
</html>