import { useRef } from 'react';

import service from '../service';

export type EventType = 'workflow_finished' | 'message_end' | 'error';

export default function useAIChat() {
    const abortController = useRef<AbortController | undefined>(undefined);

    function mutate(
        params: Record<string, any>,
        listeners: {
            onopen: () => void;
            onmessage: (type: EventType, value: string, taskId: string) => void;
            onclose: () => void;
            onerror?: (error: any) => void;
        }
    ) {
        abortController.current = new AbortController();
        try {
            service.chat(params, {
                signal: abortController.current.signal,
                openWhenHidden: true,
                async onopen() {
                    listeners.onopen?.();
                },
                onmessage(ev) {
                    try {
                        const data: {
                            event: EventType;
                            data: Record<string, any>;
                            task_id: string;
                            message?: string;
                        } = JSON.parse(ev.data);

                        if (data.event === 'message_end') {
                            listeners.onclose?.();
                            return;
                        } else if (data.event === 'error') {
                            listeners.onmessage?.(
                                data.event,
                                data.message || '',
                                data.task_id
                            );
                            listeners.onclose?.();
                            return;
                        }
                        listeners.onmessage?.(
                            data.event,
                            data.data?.outputs?.answer,
                            data.task_id
                        );
                    } catch (error) {
                        console.error(error);
                    }
                },
                onclose() {
                    listeners.onclose?.();
                },
                onerror(error) {
                    listeners.onerror?.(error);
                },
            });
        } catch {}
    }

    function abort(taskId: string) {
        abortController.current?.abort();
        if (taskId) {
            service.stopChat(taskId);
        }
    }

    return { mutate, abort };
}
