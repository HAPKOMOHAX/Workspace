# Workspace

```text
┌──────────────────────────────────────────────┐
│   Tasks · Calendar · Weekly Board · Notes    │
│        Laravel workspace planner app         │
└──────────────────────────────────────────────┘
```

Workspace is a Laravel application for task planning, weekly and monthly scheduling, and notebook canvas with movable note blocks.

The project was built as a personal Laravel practice project with a focus on CRUD operations, validation, user-specific data access, drag-and-drop interactions, and feature tests.

## Features

* User authentication
* Task creation, editing, and deletion
* Weekly task board
* Monthly calendar view
* Task reordering between dates
* Notebook sheets
* Movable note blocks
* Collision prevention for note blocks
* Validation with Form Request classes
* Ownership checks for user-specific data
* Feature tests for core behavior

## Tech Stack

* PHP 8.2+
* Laravel 12
* Blade
* Vanilla JavaScript
* Vite
* CSS
* MySQL
* PHPUnit / Laravel Feature Tests

## Requirements

Make sure you have installed:

* PHP 8.2 or newer
* Composer
* Node.js and npm
* MySQL or another database supported by Laravel

## Installation

Clone or unpack the project and install PHP dependencies:

```bash
composer install
```

Install frontend dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Configure your database connection in the `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workspace
DB_USERNAME=root
DB_PASSWORD=
```

Create a database with the same name as `DB_DATABASE`, then run migrations:

```bash
php artisan migrate
```

Build frontend assets:

```bash
npm run build
```

Start the Laravel development server:

```bash
php artisan serve
```

The application will be available at:

```text
http://127.0.0.1:8000
```

## Development Mode

For active frontend development, run Vite:

```bash
npm run dev
```

In a separate terminal, start the Laravel development server:

```bash
php artisan serve
```

Then open:

```text
http://127.0.0.1:8000
```

## Running Tests

Run the test suite with:

```bash
php artisan test
```

## Project Structure

Important directories:

```text
app/
├── Http/
│   ├── Controllers/
│   └── Requests/
├── Models/
└── Services/

database/
├── factories/
├── migrations/
└── seeders/

resources/
├── css/
├── js/
└── views/

routes/
└── web.php

tests/
└── Feature/
```

## Notes

* HTTPS is not required for local development.
* Frontend assets are built with Vite.
* The application is intended as a learning and portfolio project.
