<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceMonthTest extends TestCase
{
    use RefreshDatabase;

    public function test_month_view_uses_six_weeks_when_month_requires_it(): void
    {
        $user = User::factory()->create();

        Task::create([
            'user_id' => $user->id,
            'title' => 'End of March task',
            'description' => null,
            'scheduled_for' => '2026-03-31',
            'position' => 1,
            'status' => 'todo',
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/workspace/month/2026-03');

        $response->assertOk();
        $response->assertViewHas('weeksCount', 6);
        $response->assertSee('End of March task');
    }

    public function test_month_view_uses_five_weeks_when_month_fits(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/workspace/month/2026-05');

        $response->assertOk();
        $response->assertViewHas('weeksCount', 5);
    }
}