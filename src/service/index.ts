import { FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { sse, postAsFormData, post } from './base';

export default {
    chat(params: any, options: FetchEventSourceInit) {
        return sse('/chat-messages', params, options);
    },
    uploadFile(params: any) {
        return postAsFormData('/files/upload', params);
    },
    createSession(appName: string, userId: string) {
        return post(`/api/apps/${appName}/users/${userId}/sessions`);
    },
    runSSE(params: any, options: FetchEventSourceInit) {
        return sse('/api/run_sse', params, options);
    },
};
