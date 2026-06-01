<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }
    public function withValidator($validator): void
{
    $validator->after(function ($validator) {
        $taskIds = collect($this->input('columns', []))
            ->flatMap(fn ($column) => $column['task_ids'] ?? [])
            ->values();

        if ($taskIds->count() !== $taskIds->unique()->count()) {
            $validator->errors()->add(
                'columns',
                'Одна задача не может находиться в нескольких колонках.'
            );
        }

        $dates = collect($this->input('columns', []))
            ->pluck('date')
            ->filter()
            ->values();

        if ($dates->count() !== $dates->unique()->count()) {
            $validator->errors()->add(
                'columns',
                'Одна дата не должна повторяться несколько раз.'
            );
        }
    });
}
    public function rules(): array
    {
        return [
            'columns' => ['required', 'array', 'min:1'],
            'columns.*.date' => ['required', 'date_format:Y-m-d'],
            'columns.*.task_ids' => ['present', 'array'],
            'columns.*.task_ids.*' => ['integer'],
        ];
    }
}