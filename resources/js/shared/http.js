function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

async function readJsonResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
        const text = await response.text();

        throw new Error(
            `Ожидался JSON, но пришёл ${contentType || 'unknown'}: ${text.slice(0, 200)}`
        );
    }

    return response.json();
}

export async function requestJson(url, options = {}) {
    const { headers: customHeaders = {}, ...restOptions } = options;

    const response = await fetch(url, {
        ...restOptions,
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
            ...customHeaders,
        },
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
        const error = new Error(data.message || 'Ошибка запроса');
        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}

export async function requestDocument(url = window.location.href, options = {}) {
    const { headers: customHeaders = {}, ...restOptions } = options;

    const response = await fetch(url, {
        ...restOptions,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            ...customHeaders,
        },
    });

    if (!response.ok) {
        throw new Error(`Не удалось обновить view: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();

    return parser.parseFromString(html, 'text/html');
}