import {
    fetchEventSource,
    FetchEventSourceInit,
} from '@microsoft/fetch-event-source';

const API_URL = import.meta.env.VITE_API_URL;

export function sse<P = any>(
    url: string,
    params?: P,
    options?: FetchEventSourceInit
) {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
    };
    const { onerror, ...rest } = options || {};

    fetchEventSource(`${API_URL}${url}`, {
        method: 'POST',
        body: JSON.stringify(params || {}),
        credentials: 'same-origin',
        headers,
        onerror(err) {
            onerror?.(err);
            throw err;
        },
        ...rest,
    });
}

function request(url: string, options: Record<string, any>) {
    const headers = {
        ...(options.headers || {}),
    };
    return fetch(`${API_URL}${url}`, {
        credentials: 'same-origin',
        headers,
        ...options,
    })
        .then((response) => {
            return response.json();
        })
        .catch((err) => {
            return err;
        });
}

function buildFormData(params: Record<string, any>) {
    if (params) {
        const data = new FormData();
        for (const p in params) {
            if (p) {
                data.append(p, params[p]);
            }
        }
        return data;
    }
}

export function postAsFormData(url: string, params?: Record<string, any>) {
    const options: Record<string, any> = { method: 'POST' };
    if (params) options.body = buildFormData(params);
    return request(url, options);
}

export function post(url: string, body?: any, signal?: AbortSignal) {
    const options: Record<string, any> = { method: 'POST' };
    if (body) options.body = JSON.stringify(body);
    if (signal) options.signal = signal;
    return request(url, options);
}
