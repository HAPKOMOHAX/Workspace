import { requestJson } from '../shared/http';

export function createNotebookApi({
    storeUrl,
    updateUrlTemplate,
    destroyUrlTemplate,
    sheetId,
}) {
    function blockUpdateUrl(id) {
        return updateUrlTemplate.replace('__ID__', id);
    }

    function blockDestroyUrl(id) {
        return destroyUrlTemplate.replace('__ID__', id);
    }

    function createBlock({ content, x, y }) {
        return requestJson(storeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sheet_id: sheetId,
                content,
                x,
                y,
            }),
        });
    }

    function saveBlock({ id, content, x, y }) {
        return requestJson(blockUpdateUrl(id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                x,
                y,
            }),
        });
    }

    function deleteBlock(id) {
        return requestJson(blockDestroyUrl(id), {
            method: 'DELETE',
        });
    }

    return {
        createBlock,
        saveBlock,
        deleteBlock,
    };
}