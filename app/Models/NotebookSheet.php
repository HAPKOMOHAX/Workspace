<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotebookSheet extends Model
{
    protected $fillable = [
        'user_id',
        'display_order',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function noteBlocks(): HasMany
    {
        return $this->hasMany(NoteBlock::class, 'sheet_id');
    }
}