import {
    fetchEventSource,
    FetchEventSourceInit,
} from '@microsoft/fetch-event-source';
import { getConfig } from '../utils/config';

export function sse<P = any>(
    url: string,
    params?: P,
    options?: FetchEventSourceInit
) {
    const config = getConfig();
    if (!config) return;
    const { API_URL, API_KEY } = config;
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${API_KEY}`,
    };
    const baseParams = {
        response_mode: 'streaming',
        user: 'admin',
        inputs: {},
    };
    const { onerror, ...rest } = options || {};

    fetchEventSource(`${API_URL}${url}`, {
        method: 'POST',
        body: JSON.stringify({ ...baseParams, ...(params || {}) }),
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
    const config = getConfig();
    if (!config) return;
    const { API_URL, API_KEY } = config;
    const headers = {
        Authorization: `Bearer ${API_KEY}`,
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
