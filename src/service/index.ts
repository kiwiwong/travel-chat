import { FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { sse, postAsFormData } from './base';

export default {
    chat(params: any, options: FetchEventSourceInit) {
        return sse('/chat-messages', params, options);
    },
    stopChat(taskId: string, params?: any, options?: FetchEventSourceInit) {
        return sse(`/chat-messages/${taskId}/stop`, params, options);
    },
    uploadFile(params: any) {
        return postAsFormData('/files/upload', params);
    },
};
