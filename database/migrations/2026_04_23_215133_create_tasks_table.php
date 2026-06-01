<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->date('scheduled_for');
            $table->unsignedInteger('position')->default(0);
            $table->string('status')->default('todo');

            $table->timestamps();

            $table->index(['user_id', 'scheduled_for']);
            $table->index(['user_id', 'scheduled_for', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};