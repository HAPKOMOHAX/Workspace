<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoteBlock extends Model
{
    protected $fillable = [
        'user_id',
        'sheet_id',
        'content',
        'x',
        'y',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sheet(): BelongsTo
    {
        return $this->belongsTo(NotebookSheet::class, 'sheet_id');
    }
}