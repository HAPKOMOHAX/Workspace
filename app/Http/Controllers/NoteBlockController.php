<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteBlockRequest;
use App\Http\Requests\UpdateNoteBlockRequest;
use App\Models\NoteBlock;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\NotebookSheet;

class NoteBlockController extends Controller
{
    public function store(StoreNoteBlockRequest $request): JsonResponse
{
    $sheetId = (int) $request->validated()['sheet_id'];

    $sheet = $request->user()
        ->notebookSheets()
        ->findOrFail($sheetId);

    $payload = $request->validated();

    $block = $sheet->noteBlocks()->create([
        'user_id' => $request->user()->id,
        'content' => $payload['content'] ?? '',
        'x' => $payload['x'],
        'y' => $payload['y'],
    ]);

    return response()->json([
        'success' => true,
        'block' => $this->serializeBlock($block),
    ], 201);
}

    public function update(UpdateNoteBlockRequest $request, int $id): JsonResponse
    {
        try {
            $block = $request->user()->noteBlocks()->findOrFail($id);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Блок не найден',
            ], 404);
        }

        $block->update($request->validated());
        $block->refresh();

        return response()->json([
            'success' => true,
            'block' => $this->serializeBlock($block),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $block = $request->user()->noteBlocks()->findOrFail($id);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Блок не найден',
            ], 404);
        }

        $block->delete();

        return response()->json([
            'success' => true,
            'message' => 'Блок удалён',
        ]);
    }

    private function serializeBlock(NoteBlock $block): array
    {
        return [
            'id' => $block->id,
            'content' => $block->content ?? '',
            'x' => (int) $block->x,
            'y' => (int) $block->y,
        ];
    }
}