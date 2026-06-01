<?php

namespace App\Http\Requests;
use Illuminate\Validation\Rule;
class StoreNoteBlockRequest extends NoteBlockPayloadRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'sheet_id' => [
            'required',
            'integer',
             Rule::exists('notebook_sheets', 'id')
            ->where('user_id', $this->user()->id),
            ],
            ]);
    }
}