import { useRef } from 'react';

import service from '../service';

interface IContent {
    parts: { text: string }[];
    role: string;
}

interface IData {
    invocationId: string;
    author: string;
    actions: {
        stateDelta: Record<string, any>;
        artifactDelta: Record<string, any>;
        requestedAuthConfigs: Record<string, any>;
    };
    id: string;
    timestamp: number;
    content?: IContent;
    partial?: boolean;
    error?: string;
}

export default function useChat() {
    const abortController = useRef<AbortController | undefined>(undefined);

    function mutate(
        params: Record<string, any>,
        listeners: {
            onopen: () => void;
            onmessage: (value: string, taskId: string) => void;
            onclose: () => void;
            onerror?: (error: any) => void;
            oncomplete?: (message: string) => void;
        }
    ) {
        abortController.current = new AbortController();
        try {
            service.runSSE(params, {
                signal: abortController.current.signal,
                openWhenHidden: true,
                async onopen() {
                    listeners.onopen?.();
                },
                onmessage(ev) {
                    try {
                        const data: IData = JSON.parse(ev.data);

                        if (data.error) {
                            listeners.onerror?.(data.error);
                            return;
                        }

                        if (data.content?.parts?.[0]?.text) {
                            if (data.partial) {
                                listeners.onmessage?.(
                                    data.content.parts[0].text,
                                    data.invocationId
                                );
                            } else {
                                listeners.oncomplete?.(
                                    data.content.parts[0].text
                                );
                            }
                        }
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
        } catch (error) {
            console.error(error);
        }
    }

    function abort() {
        abortController.current?.abort();
    }

    return { mutate, abort };
}
