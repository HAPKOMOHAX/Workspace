<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class TaskPayloadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation(): void
    {
        $title = $this->input('title');
        $description = $this->input('description');
        $status = $this->input('status');

        $prepared = [];

        if (is_string($title)) {
            $prepared['title'] = trim($title);
        }

        if (is_string($description)) {
            $prepared['description'] = trim($description) === '' ? null : trim($description);
        }

        if ($status === '') {
            $prepared['status'] = null;
        }

        if (!empty($prepared)) {
            $this->merge($prepared);
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scheduled_for' => ['required', 'date_format:Y-m-d'],
            'status' => ['nullable', 'string', 'in:todo,done'],
        ];
    }
}