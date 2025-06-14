import React, { useEffect, useState, useMemo, useRef } from 'react';
import type { Components } from 'react-markdown';
import { Button, message } from 'antd';
import rehypeRaw from 'rehype-raw';
import { Chat } from 'dt-react-component';
import {
    MessageStatus,
    Message,
    Prompt,
} from 'dt-react-component/esm/chat/entity';
import CustomTSX from '../customTSX';
import ChatInput, { type IFile, Mode } from '../chatInput';
import useCreateSession from '../../hooks/useCreateSession';
import useChat from '../../hooks/useChat';
import { IMarker } from '../../types';
import { extractAndRemoveAllTSX } from '../../utils';

import './index.scss';

const svgLogoStr = `
<svg t="1749780679693" class="icon" viewBox="0 0 1024 1024" version="1.1"
    xmlns="http://www.w3.org/2000/svg" p-id="7034" width="1em" height="1em">
    <path
        d="M262.832851 649.648042m74.183103 19.877303l0 0q74.183103 19.877303 54.305801 94.060406l-19.877303 74.183103q-19.877303 74.183103-94.060406 54.305801l0 0q-74.183103-19.877303-54.305801-94.060406l19.877303-74.183103q19.877303-74.183103 94.060406-54.305801Z"
        fill="currentColor" p-id="7035"></path>
    <path
        d="M665.6 102.4c141.3888 0 256 114.6112 256 256v128a254.7968 254.7968 0 0 1-40.704 138.5728 152.9344 152.9344 0 0 0-41.728-41.2928l-2.5088-1.6896a152.2176 152.2176 0 0 0-224.9728 68.096L573.184 742.4H358.4C217.0112 742.4 102.4 627.7888 102.4 486.4V153.6a51.2 51.2 0 0 1 51.2-51.2h512z m125.44 512.9728c6.016 2.5088 11.776 5.6064 17.2032 9.216l2.5088 1.6896c16 10.6752 28.032 25.088 35.712 41.2672A255.104 255.104 0 0 1 665.6 742.4h-36.9408l30.2848-72.6272a101.0176 101.0176 0 0 1 132.096-54.4zM665.6 204.8h-230.4a153.6 153.6 0 0 0-153.4976 147.84L281.6 358.4v51.2a102.4 102.4 0 0 0 97.28 102.272L384 512h332.8a102.4 102.4 0 0 0 102.272-97.28L819.2 409.6v-51.2a153.6 153.6 0 0 0-153.6-153.6z"
        fill="currentColor" p-id="7036"></path>
    <path
        d="M807.0144 621.9264l2.5344 1.664a102.4 102.4 0 0 1 18.5088 154.5472l-76.16 82.7648a87.296 87.296 0 0 1-107.3152 16.7936 78.3872 78.3872 0 0 1-33.6384-98.304l46.7712-112.2816a101.0176 101.0176 0 0 1 149.2992-45.184z"
        fill="currentColor" p-id="7037"></path>
    <path
        d="M435.2 281.6m51.2 0l0 0q51.2 0 51.2 51.2l0 51.2q0 51.2-51.2 51.2l0 0q-51.2 0-51.2-51.2l0-51.2q0-51.2 51.2-51.2Z"
        fill="currentColor" p-id="7038"></path>
    <path
        d="M640 281.6m51.2 0l0 0q51.2 0 51.2 51.2l0 51.2q0 51.2-51.2 51.2l0 0q-51.2 0-51.2-51.2l0-51.2q0-51.2 51.2-51.2Z"
        fill="currentColor" p-id="7039"></path>
</svg>
`;

interface IAIChatProps {
    updateMarkers: (markers: IMarker[]) => void;
    style?: React.CSSProperties;
}

export default function AIChat({ style, updateMarkers }: IAIChatProps) {
    const chat = Chat.useChat();
    const chatReq = useChat();
    const { sessionId } = useCreateSession();

    const [value, setValue] = useState<string | undefined>('');
    const [convert, setConvert] = useState(false);
    const [file, setFile] = useState<IFile | undefined>();
    const [mode, setMode] = useState<Mode>(Mode.KNOWLEDGE);

    const currentTaskId = useRef('');

    useEffect(() => {
        chat.conversation.create({ id: new Date().valueOf().toString() });
    }, []);

    const generatePromptStr = (text?: string, file?: IFile) => {
        if (!file) return text;

        switch (file.type) {
            case 'jpg':
            case 'jpeg':
            case 'png': {
                return file.base64
                    ? `![image](${file.base64})  \n${text}`
                    : text;
            }
            case 'xls':
            case 'xlsx':
            case 'pdf': {
                return `${text}  \n\`${file.name}\``;
            }
            default:
                return text;
        }
    };

    const replaceIcon = () => {
        const elems = document.querySelectorAll('.dtc__message__avatar');
        elems?.forEach((elem) => {
            elem.innerHTML = svgLogoStr;
        });
    };

    const handleSubmit = (raw = value) => {
        const val = raw?.trim();
        const uploadfile = file;
        if (chat.loading() || (!val && !file)) return;

        const promptStr = generatePromptStr(val, uploadfile);
        if (!promptStr) return;

        setValue('');
        setFile(undefined);
        currentTaskId.current = '';

        const promptId = new Date().valueOf().toString();
        const messageId = (new Date().valueOf() + 1).toString();

        chat.prompt.create({ id: promptId, title: promptStr });
        chat.message.create(promptId, { id: messageId, content: '' });

        chatReq.mutate(
            {
                appName: 'travel_agent',
                userId: 'user',
                sessionId: sessionId,
                newMessage: {
                    role: 'user',
                    parts: [{ text: val }],
                },
                streaming: true,
            },
            {
                onopen() {
                    chat.start(promptId, messageId);
                },
                onmessage(msg, taskId) {
                    chat.push(promptId, messageId, msg);

                    // FIXME: 貌似可以通过 prompt 中的 assistantId 来挂载 taskId，不过不生效，先直接用 ref 保存
                    if (!currentTaskId.current && taskId) {
                        currentTaskId.current = taskId;
                    }
                },
                oncomplete(msg) {
                    const { json, str } = extractAndRemoveAllTSX<IMarker>(msg);
                    console.log(str, json);
                    chat.message.update(promptId, messageId, {
                        content: str,
                    });
                    if (json.length > 0) {
                        updateMarkers(json);
                    }
                },
                onclose() {
                    chat.close(promptId, messageId);
                },
                onerror(error) {
                    message.error(error || '请求失败！');
                    const prompt = chat.prompt.get(promptId);
                    const msg = chat.message.get(promptId, messageId);
                    // 接口请求失败时自动停止回答
                    if (prompt && msg) {
                        handleStop(msg, prompt);
                    }
                },
            }
        );

        setTimeout(() => {
            replaceIcon();
        });
    };

    const components = useMemo(
        () =>
            ({
                a: ({ children }) => (
                    <Button
                        type="primary"
                        size="small"
                        ghost
                        onClick={() => setConvert((p) => !p)}
                    >
                        {children}
                    </Button>
                ),
                tsx: ({ type, node }: any, _: any, { messageId }: any) => {
                    return (
                        <React.Suspense fallback={<Chat.Loading loading />}>
                            <CustomTSX
                                key={messageId}
                                type={type}
                                data={node}
                            />
                        </React.Suspense>
                    );
                },
            } as Components),
        []
    );

    const handleStop = (data: Message, prompt: Prompt) => {
        chatReq.abort();
        chat.message.update(prompt.id, data.id, {
            status: MessageStatus.STOPPED,
        });
    };

    return (
        <div
            style={{
                ...style,
                width: '100%',
                height: 'calc(100vh - 145px)',
                marginBottom: 56,
            }}
        >
            <Chat
                chat={chat}
                rehypePlugins={[rehypeRaw]}
                codeBlock={{
                    convert,
                }}
                components={components}
                regenerate={false}
                copy={{
                    formatText: (content) =>
                        content
                            ?.replace(/<TSX type=".*">.*<\/TSX>/, '')
                            .trim() || '',
                    onCopy() {
                        message.success('复制成功');
                    },
                }}
            >
                <Chat.Content
                    data={chat.conversation.get()?.prompts || []}
                    onStop={handleStop}
                    placeholder={
                        <div
                            style={{
                                maxWidth: 800,
                                margin: '0 auto',
                                paddingTop: 80,
                            }}
                        >
                            <Chat.Welcome
                                title="嗨，近来可好 👋"
                                description="你想去哪里？我可以帮你规划你的旅行。"
                                icon={React.createElement('span', {
                                    className: 'dtc__welcome__avatar',
                                    dangerouslySetInnerHTML: {
                                        __html: svgLogoStr,
                                    },
                                })}
                            />
                        </div>
                    }
                />
                <ChatInput
                    value={value}
                    mode={mode}
                    onChange={setValue}
                    onPressEnter={() => handleSubmit()}
                    onPressShiftEnter={() => setValue((v) => v + '\n')}
                    onModeChange={(mode) => setMode(mode)}
                    button={{
                        disabled:
                            chat.loading() ||
                            (!value?.trim() && !file) ||
                            (file && !file.id),
                    }}
                    placeholder="请输入想咨询的内容…"
                    file={file}
                    setFile={(file) => setFile(file)}
                    onSubmit={() => handleSubmit()}
                />
            </Chat>
        </div>
    );
}
