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
import useAIChat from '../../hooks/useAIChat';
import ChatInput, { type IFile, Mode } from '../chatInput';

import './index.scss';

export default function AIChat() {
    const chat = Chat.useChat();
    const chatRequest = useAIChat();

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

    const getHistory = () => {
        const conversation = chat.conversation.get();
        const history: string[] = [];

        conversation?.prompts?.forEach((prompt) => {
            const title = prompt.title || '';
            const hasMessage = prompt.messages?.some((msg) => !!msg.content);
            if (hasMessage) {
                // 匹配 base64 图片的 markdown，提取用户输入的内容
                const regex = /!\[.*\]\(data:image\/.*;base64,.*\)\s*\n(.*)/;
                const matchResult = title.match(regex);
                const query = matchResult ? matchResult[1] : title;

                history.push(`[User]:${query}`);
                prompt.messages.forEach((msg) => {
                    history.push(`[Agent]:${msg.content}`);
                });
            }
        });
        return history.join('\n');
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
        const file_content = uploadfile
            ? JSON.stringify({
                  file_id: uploadfile.id,
                  type: uploadfile.type,
              })
            : '';

        chat.prompt.create({ id: promptId, title: promptStr });
        chat.message.create(promptId, { id: messageId, content: '' });

        chatRequest.mutate(
            {
                query: val,
                inputs: { file_content, history: getHistory(), type: mode },
            },
            {
                onopen() {
                    chat.start(promptId, messageId);
                },
                onmessage(type, value, taskId) {
                    if (type === 'workflow_finished') {
                        chat.push(promptId, messageId, value);
                    } else if (type === 'error') {
                        chat.message.update(promptId, messageId, {
                            content: '当前问题暂时无法回答，请换个问题吧~',
                        });
                    }

                    // FIXME: 貌似可以通过 prompt 中的 assistantId 来挂载 taskId，不过不生效，先直接用 ref 保存
                    if (!currentTaskId.current && taskId) {
                        currentTaskId.current = taskId;
                    }
                },
                onclose() {
                    chat.close(promptId, messageId);
                },
                onerror() {
                    message.error("请求失败！");
                    const prompt = chat.prompt.get(promptId);
                    const msg = chat.message.get(promptId, messageId);
                    // 接口请求失败时自动停止回答
                    if (prompt && msg) {
                        handleStop(msg, prompt);
                    }
                }
            }
        );
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
        chatRequest.abort(currentTaskId.current);
        chat.message.update(prompt.id, data.id, {
            status: MessageStatus.STOPPED,
        });
    };

    return (
        <div
            style={{
                width: '100%',
                height: 'calc(100vh - 200px)',
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
                                title="你好，我是灵瞳"
                                description="精通数据查询、趋势分析与预测，助你高效决策。"
                            />
                            {/* 暂时隐藏预设问题部分 */}
                            {/* <div
                                style={{
                                    color: '#64698b',
                                    fontSize: 12,
                                    margin: '16px 0',
                                    lineHeight: '20px',
                                }}
                            >
                                你可以这样问：
                            </div>
                            <Flex vertical align="start" gap="4px">
                                <Chat.Tag
                                    onClick={() =>
                                        handleSubmit('按年销售额排序')
                                    }
                                >
                                    按年销售额排序
                                </Chat.Tag>
                                <Chat.Tag
                                    onClick={() =>
                                        handleSubmit(
                                            '按年销售额排序，并以柱状图展示'
                                        )
                                    }
                                >
                                    按年销售额排序，并以柱状图展示
                                </Chat.Tag>
                            </Flex> */}
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
