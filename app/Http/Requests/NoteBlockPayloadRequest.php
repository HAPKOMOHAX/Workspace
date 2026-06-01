<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class NoteBlockPayloadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation(): void
{
    $content = $this->input('content');

    $prepared = [];

    if (is_string($content)) {
        $prepared['content'] = trim(str_replace("\r\n", "\n", $content));
    }

    if (! empty($prepared)) {
        $this->merge($prepared);
    }

    
    
}

    public function rules(): array
    {
        return [
            'content' => ['nullable', 'string', 'max:10000'],
            'x' => ['required', 'integer', 'min:0'],
            'y' => ['required', 'integer', 'min:0'],
        ];
    }
}