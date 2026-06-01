<?php

namespace Tests\Feature;

use App\Models\NoteBlock;
use App\Models\NotebookSheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteBlockControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_note_block_in_their_sheet(): void
    {
        $user = User::factory()->create();

        $sheet = NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 1,
        ]);

        $response = $this
            ->actingAs($user)
            ->postJson('/notebook/blocks', [
                'sheet_id' => $sheet->id,
                'content' => "  Первый блок  \r\n",
                'x' => 120,
                'y' => 80,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('block.content', 'Первый блок')
            ->assertJsonPath('block.x', 120)
            ->assertJsonPath('block.y', 80);

        $this->assertDatabaseHas('note_blocks', [
            'user_id' => $user->id,
            'sheet_id' => $sheet->id,
            'content' => 'Первый блок',
            'x' => 120,
            'y' => 80,
        ]);
    }

    public function test_user_cannot_create_block_in_someone_elses_sheet(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $sheet = NotebookSheet::create([
            'user_id' => $otherUser->id,
            'display_order' => 1,
        ]);

        $response = $this
            ->actingAs($user)
            ->postJson('/notebook/blocks', [
                'sheet_id' => $sheet->id,
                'content' => 'чужой лист',
                'x' => 10,
                'y' => 20,
            ]);

            $response->assertUnprocessable();
            $response->assertJsonValidationErrors(['sheet_id']);

        $this->assertDatabaseCount('note_blocks', 0);
    }

    public function test_user_can_update_their_note_block(): void
    {
        $user = User::factory()->create();

        $sheet = NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 1,
        ]);

        $block = NoteBlock::create([
            'user_id' => $user->id,
            'sheet_id' => $sheet->id,
            'content' => 'Старый текст',
            'x' => 10,
            'y' => 20,
        ]);

        $response = $this
            ->actingAs($user)
            ->putJson("/notebook/blocks/{$block->id}", [
                'content' => '  Новый текст  ',
                'x' => 200,
                'y' => 300,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('block.content', 'Новый текст')
            ->assertJsonPath('block.x', 200)
            ->assertJsonPath('block.y', 300);

        $this->assertDatabaseHas('note_blocks', [
            'id' => $block->id,
            'content' => 'Новый текст',
            'x' => 200,
            'y' => 300,
        ]);
    }

    public function test_user_cannot_delete_someone_elses_note_block(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $sheet = NotebookSheet::create([
            'user_id' => $otherUser->id,
            'display_order' => 1,
        ]);

        $block = NoteBlock::create([
            'user_id' => $otherUser->id,
            'sheet_id' => $sheet->id,
            'content' => 'Чужой блок',
            'x' => 1,
            'y' => 1,
        ]);

        $response = $this
            ->actingAs($user)
            ->deleteJson("/notebook/blocks/{$block->id}");

        $response
            ->assertNotFound()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('note_blocks', [
            'id' => $block->id,
        ]);
    }

    public function test_user_can_delete_their_note_block(): void
    {
        $user = User::factory()->create();

        $sheet = NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 1,
        ]);

        $block = NoteBlock::create([
            'user_id' => $user->id,
            'sheet_id' => $sheet->id,
            'content' => 'Мой блок',
            'x' => 50,
            'y' => 60,
        ]);

        $response = $this
            ->actingAs($user)
            ->deleteJson("/notebook/blocks/{$block->id}");

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('note_blocks', [
            'id' => $block->id,
        ]);
    }
}