<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_blocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('sheet_id')
                ->constrained('notebook_sheets')
                ->cascadeOnDelete();

            $table->text('content')->nullable();
            $table->unsignedInteger('x');
            $table->unsignedInteger('y');

            $table->timestamps();

            $table->index(['user_id', 'sheet_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_blocks');
    }
};