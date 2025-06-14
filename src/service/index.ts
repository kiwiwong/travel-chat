import { FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { sse, post } from './base';

export default {
    createSession(appName: string, userId: string) {
        return post(`/api/apps/${appName}/users/${userId}/sessions`);
    },
    runSSE(params: any, options: FetchEventSourceInit) {
        return sse('/api/run_sse', params, options);
    },
};
