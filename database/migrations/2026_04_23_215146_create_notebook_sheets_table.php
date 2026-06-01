<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notebook_sheets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedInteger('display_order');

            $table->timestamps();

            $table->unique(['user_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notebook_sheets');
    }
};