<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\NoteBlockController;
use App\Http\Controllers\NotebookSheetController;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth'])->group(function () {
    // Профиль пользователя
    Route::get('/profile', [ProfileController::class, 'settings'])->name('profile.settings');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Задачи
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/list', [TaskController::class, 'list'])->name('tasks.list');
    Route::put('/tasks/{id}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::patch('/tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');

    // Workspace
        // month view
        Route::get('/workspace/month/{month?}', [WorkspaceController::class, 'month'])
        ->where('month', '\d{4}-\d{2}')
        ->name('workspace.month');
        // week board
        Route::get('/workspace/week/{date?}', [WorkspaceController::class, 'weekBoard'])
        ->where('date', '\d{4}-\d{2}-\d{2}')
        ->name('workspace.week');
        //Notebook
        Route::get('/workspace/notebook', [WorkspaceController::class, 'notebook'])
        ->name('workspace.notebook');

        Route::post('/notebook/blocks', [NoteBlockController::class, 'store'])
            ->name('notebook.blocks.store');

        Route::put('/notebook/blocks/{id}', [NoteBlockController::class, 'update'])
            ->name('notebook.blocks.update');

        Route::delete('/notebook/blocks/{id}', [NoteBlockController::class, 'destroy'])
            ->name('notebook.blocks.destroy');
            Route::post('/workspace/notebook/sheets', [NotebookSheetController::class, 'store'])
            ->name('workspace.notebook.sheets.store');
        
        Route::delete('/workspace/notebook/sheets/{id}', [NotebookSheetController::class, 'destroy'])
            ->name('workspace.notebook.sheets.destroy');
});

require __DIR__ . '/auth.php';