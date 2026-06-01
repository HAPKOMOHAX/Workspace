<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_task(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->postJson('/tasks', [
                'title' => '  Сделать карточку  ',
                'description' => '  Проверить создание  ',
                'scheduled_for' => '2026-04-23',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('task.title', 'Сделать карточку')
            ->assertJsonPath('task.description', 'Проверить создание')
            ->assertJsonPath('task.scheduled_for', '2026-04-23')
            ->assertJsonPath('task.status', 'todo')
            ->assertJsonPath('task.position', 1);

            $this->assertTrue(
                Task::query()
                    ->where('user_id', $user->id)
                    ->where('title', 'Сделать карточку')
                    ->where('description', 'Проверить создание')
                    ->whereDate('scheduled_for', '2026-04-23')
                    ->where('status', 'todo')
                    ->where('position', 1)
                    ->exists()
            );
    }

    public function test_updating_task_to_another_day_moves_it_to_end_of_new_day(): void
    {
        $user = User::factory()->create();

        $taskToMove = Task::create([
            'user_id' => $user->id,
            'title' => 'Переносимая',
            'description' => null,
            'scheduled_for' => '2026-04-23',
            'position' => 1,
            'status' => 'todo',
        ]);

        Task::create([
            'user_id' => $user->id,
            'title' => 'Уже на новом дне',
            'description' => null,
            'scheduled_for' => '2026-04-24',
            'position' => 1,
            'status' => 'todo',
        ]);

        $response = $this
            ->actingAs($user)
            ->putJson("/tasks/{$taskToMove->id}", [
                'title' => 'Переносимая',
                'description' => null,
                'scheduled_for' => '2026-04-24',
                'status' => 'done',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('task.scheduled_for', '2026-04-24')
            ->assertJsonPath('task.position', 2)
            ->assertJsonPath('task.status', 'done');

            $this->assertTrue(
                Task::query()
                    ->whereKey($taskToMove->id)
                    ->whereDate('scheduled_for', '2026-04-24')
                    ->where('position', 2)
                    ->where('status', 'done')
                    ->exists()
            );
    }

    public function test_deleting_task_reindexes_positions_for_that_day(): void
    {
        $user = User::factory()->create();

        $first = Task::create([
            'user_id' => $user->id,
            'title' => 'Первая',
            'description' => null,
            'scheduled_for' => '2026-04-23',
            'position' => 1,
            'status' => 'todo',
        ]);

        $second = Task::create([
            'user_id' => $user->id,
            'title' => 'Вторая',
            'description' => null,
            'scheduled_for' => '2026-04-23',
            'position' => 2,
            'status' => 'todo',
        ]);

        $third = Task::create([
            'user_id' => $user->id,
            'title' => 'Третья',
            'description' => null,
            'scheduled_for' => '2026-04-23',
            'position' => 3,
            'status' => 'todo',
        ]);

        $response = $this
            ->actingAs($user)
            ->deleteJson("/tasks/{$second->id}");

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('tasks', [
            'id' => $second->id,
        ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $first->id,
            'position' => 1,
        ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $third->id,
            'position' => 2,
        ]);
    }

    public function test_user_cannot_update_someone_elses_task(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $task = Task::create([
            'user_id' => $otherUser->id,
            'title' => 'Чужая задача',
            'description' => null,
            'scheduled_for' => '2026-04-23',
            'position' => 1,
            'status' => 'todo',
        ]);

        $response = $this
            ->actingAs($user)
            ->putJson("/tasks/{$task->id}", [
                'title' => 'Попытка взлома вселенной',
                'description' => null,
                'scheduled_for' => '2026-04-23',
                'status' => 'todo',
            ]);

        $response
            ->assertNotFound()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Чужая задача',
        ]);
    }

    public function test_user_can_reorder_tasks_between_columns(): void
    {
        $user = User::factory()->create();

        $taskA = Task::create([
            'user_id' => $user->id,
            'title' => 'A',
            'description' => null,
            'scheduled_for' => '2026-04-23',
            'position' => 1,
            'status' => 'todo',
        ]);

        $taskB = Task::create([
            'user_id' => $user->id,
            'title' => 'B',
            'description' => null,
            'scheduled_for' => '2026-04-23',
            'position' => 2,
            'status' => 'todo',
        ]);

        $taskC = Task::create([
            'user_id' => $user->id,
            'title' => 'C',
            'description' => null,
            'scheduled_for' => '2026-04-24',
            'position' => 1,
            'status' => 'todo',
        ]);

        $response = $this
            ->actingAs($user)
            ->patchJson('/tasks/reorder', [
                'columns' => [
                    [
                        'date' => '2026-04-23',
                        'task_ids' => [$taskB->id],
                    ],
                    [
                        'date' => '2026-04-24',
                        'task_ids' => [$taskC->id, $taskA->id],
                    ],
                ],
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

            $this->assertTrue(
                Task::query()
                    ->whereKey($taskB->id)
                    ->whereDate('scheduled_for', '2026-04-23')
                    ->where('position', 1)
                    ->exists()
            );
            
            $this->assertTrue(
                Task::query()
                    ->whereKey($taskC->id)
                    ->whereDate('scheduled_for', '2026-04-24')
                    ->where('position', 1)
                    ->exists()
            );
            
            $this->assertTrue(
                Task::query()
                    ->whereKey($taskA->id)
                    ->whereDate('scheduled_for', '2026-04-24')
                    ->where('position', 2)
                    ->exists()
            );
    }
}