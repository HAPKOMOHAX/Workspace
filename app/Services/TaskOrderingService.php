<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TaskOrderingService
{
    public function nextPositionForDate(int $userId, string $date): int
    {
        $maxPosition = Task::query()
            ->where('user_id', $userId)
            ->whereDate('scheduled_for', $date)
            ->lockForUpdate()
            ->max('position');

        return ((int) $maxPosition) + 1;
    }

    public function normalizePositionsForDate(int $userId, string $date): void
    {
        $tasks = Task::query()
            ->where('user_id', $userId)
            ->whereDate('scheduled_for', $date)
            ->orderBy('position')
            ->orderBy('id')
            ->lockForUpdate()
            ->get(['id', 'position']);

        foreach ($tasks as $index => $task) {
            $expectedPosition = $index + 1;

            if ((int) $task->position !== $expectedPosition) {
                Task::query()
                    ->whereKey($task->id)
                    ->update(['position' => $expectedPosition]);
            }
        }
    }
    public function reorderColumns(int $userId, array $columns): void
{
    DB::transaction(function () use ($userId, $columns) {
        $affectedDates = [];

        foreach ($columns as $column) {
            $date = $column['date'];
            $taskIds = $column['task_ids'];

            $affectedDates[$date] = true;

            if (empty($taskIds)) {
                continue;
            }

            $tasks = Task::query()
                ->where('user_id', $userId)
                ->whereIn('id', $taskIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($tasks->count() !== count($taskIds)) {
                throw new HttpException(403, 'Найдены чужие или несуществующие задачи');
            }

            foreach ($tasks as $task) {
                $oldDate = $task->scheduled_for?->toDateString();

                if ($oldDate) {
                    $affectedDates[$oldDate] = true;
                }
            }

            foreach ($taskIds as $index => $taskId) {
                $tasks[$taskId]->update([
                    'scheduled_for' => $date,
                    'position' => $index + 1,
                ]);
            }
        }

        foreach (array_keys($affectedDates) as $date) {
            $this->normalizePositionsForDate($userId, $date);
        }
    });
}   

public function findUserTask(int $userId, int $id): Task
{
    return Task::query()
        ->where('user_id', $userId)
        ->findOrFail($id);
}
}