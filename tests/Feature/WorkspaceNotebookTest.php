<?php

namespace Tests\Feature;

use App\Models\NotebookSheet;
use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceNotebookTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_first_notebook_visit_creates_initial_sheet(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseCount('notebook_sheets', 0);

        $response = $this
            ->actingAs($user)
            ->get('/workspace/notebook');

        $response->assertOk();

        $this->assertDatabaseCount('notebook_sheets', 1);

        $this->assertDatabaseHas('notebook_sheets', [
            'user_id' => $user->id,
            'display_order' => 1,
        ]);
    }

    public function test_creating_new_sheet_redirects_to_that_sheet(): void
    {
        $user = User::factory()->create();

        NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 1,
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/workspace/notebook/sheets');

        $this->assertDatabaseCount('notebook_sheets', 2);

        $newSheet = NotebookSheet::where('user_id', $user->id)
            ->orderByDesc('id')
            ->first();

        $response->assertRedirect(route('workspace.notebook', [
            'sheet' => $newSheet->id,
        ]));
    }

    public function test_last_sheet_cannot_be_deleted(): void
    {
        $user = User::factory()->create();

        $sheet = NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 1,
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/workspace/notebook/sheets/{$sheet->id}");

        $response->assertRedirect(route('workspace.notebook', [
            'sheet' => $sheet->id,
        ]));

        $this->assertDatabaseHas('notebook_sheets', [
            'id' => $sheet->id,
        ]);
    }

    public function test_deleting_sheet_reorders_remaining_sheets_and_redirects_to_fallback(): void
    {
        $user = User::factory()->create();

        $first = NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 1,
        ]);

        $second = NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 2,
        ]);

        $third = NotebookSheet::create([
            'user_id' => $user->id,
            'display_order' => 3,
        ]);

        $response = $this
            ->actingAs($user)
            ->delete("/workspace/notebook/sheets/{$second->id}");

        $response->assertRedirect(route('workspace.notebook', [
            'sheet' => $first->id,
        ]));

        $this->assertDatabaseMissing('notebook_sheets', [
            'id' => $second->id,
        ]);

        $this->assertDatabaseHas('notebook_sheets', [
            'id' => $first->id,
            'display_order' => 1,
        ]);

        $this->assertDatabaseHas('notebook_sheets', [
            'id' => $third->id,
            'display_order' => 2,
        ]);
    }
}