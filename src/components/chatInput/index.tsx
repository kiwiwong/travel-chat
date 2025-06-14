import { useState, useMemo } from 'react';
import {
    Input as AntdInput,
    Upload,
    Tooltip,
    message,
    Select,
    Spin,
} from 'antd';
import type { RcFile } from 'antd/lib/upload';
import { TextAreaProps } from 'antd/lib/input/TextArea';
import {
    CloseCircleFilled,
    PaperClipOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import service from '../../service';
import { convertFileToBase64 } from '../../utils';
import { getConfig } from '../../utils/config';

import './index.scss';

export interface IFile {
    name: string;
    type: string;
    base64: string;
    id?: string;
}

/**
 * 问答模式
 */
export enum Mode {
    /**
     * 发票识别
     */
    INVOICE = 'invoice',
    /**
     * excel问答
     */
    EXCEL = 'excel',
    /**
     * 知识库问答
     */
    KNOWLEDGE = 'knowledge',
    /**
     * 需求文档生成
     */
    DOC_AIGC = 'doc_aigc',
}

const modeOptions = [
    { label: '发票识别', value: Mode.INVOICE },
    { label: 'excel问答', value: Mode.EXCEL },
    { label: '知识库问答', value: Mode.KNOWLEDGE },
    { label: '需求文档生成', value: Mode.DOC_AIGC },
];

const imageTypes = ['png', 'jpg', 'jpeg'];

interface IInputProps
    extends Omit<TextAreaProps, 'value' | 'onChange' | 'onSubmit'> {
    value?: string;
    button?: {
        disabled?: boolean;
    };
    file?: IFile;
    mode?: Mode;
    onChange?: (str?: string) => void;
    onPressShiftEnter?: TextAreaProps['onPressEnter'];
    onSubmit?: (str?: string) => void;
    onModeChange?: (mode: Mode) => void;
    setFile?: (file?: IFile) => void;
}

export default function ChatInput({
    onChange,
    onPressEnter,
    onPressShiftEnter,
    onSubmit,
    setFile,
    onModeChange,
    button,
    className,
    file,
    mode,
    ...rest
}: IInputProps) {
    const [uploading, setUploading] = useState(false);

    const existFile = !!file;
    const existImage = !!file?.type && imageTypes.includes(file?.type);
    const disableSend = button?.disabled || uploading;

    const config = useMemo(() => {
        return getConfig();
    }, []);

    const handleChange: TextAreaProps['onChange'] = (e) => {
        onChange?.(e.target.value);
    };

    const beforeUpload = async (file: RcFile) => {
        const name = file.name;
        const type = name.slice(name.lastIndexOf('.') + 1);
        const base64 = imageTypes.includes(type)
            ? await convertFileToBase64(file)
            : '';
        const fileInfo = { name, type, base64 };

        setFile?.(fileInfo);
        uploadFile(file, fileInfo);
        return false;
    };

    const uploadFile = async (file: RcFile, fileInfo: IFile) => {
        try {
            if (!file) return false;

            setUploading(true);
            const res = await service.uploadFile({ file });

            if (res?.[0]) {
                setFile?.({ ...fileInfo, id: res[0].id });
            } else {
                message.error(`File upload failed.`);
            }
        } catch {
            message.error(`File upload failed.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="demo__chat__textarea__container">
            {existFile && (
                <Spin
                    wrapperClassName="demo__chat__textarea__file"
                    spinning={uploading}
                    size="small"
                >
                    {existImage ? (
                        <img
                            className="demo__chat__textarea__file__img"
                            src={file.base64}
                        />
                    ) : (
                        <span className="demo__chat__textarea__file__name">
                            {file.name}
                        </span>
                    )}
                    {!uploading && (
                        <CloseCircleFilled
                            className="demo__chat__textarea__file__close"
                            onClick={() => setFile?.(undefined)}
                        />
                    )}
                </Spin>
            )}
            <AntdInput.TextArea
                className={classNames('demo__chat__textarea', className)}
                {...rest}
                onChange={handleChange}
                onPressEnter={(e) => {
                    e.persist();
                    e.preventDefault();
                    if (e.shiftKey) {
                        onPressShiftEnter?.(e);
                    } else {
                        onPressEnter?.(e);
                    }
                }}
                autoSize={{
                    minRows: 3,
                    maxRows: 7,
                }}
            />
            <div
                className={classNames(
                    'demo__chat__textarea__send',
                    disableSend && 'demo__chat__textarea__send--disabled'
                )}
                onClick={() => !disableSend && onSubmit?.(rest.value)}
            >
                <ArrowUpOutlined />
            </div>
            {config?.ENABLE_UPLOAD_FILE && (
                <Upload
                    className="demo__chat__textarea__upload"
                    accept=".png,.jpg,jpeg,.pdf,.xls,.xlsx"
                    maxCount={1}
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    disabled={existFile}
                >
                    <Tooltip title={existImage ? '' : '上传文件'}>
                        <PaperClipOutlined
                            className={classNames(
                                'demo__chat__textarea__image',
                                existFile &&
                                    'demo__chat__textarea__image--disabled'
                            )}
                        />
                    </Tooltip>
                </Upload>
            )}
            {config?.ENABLE_SELECT_MODE && (
                <Select
                    className="demo__chat__textarea__select"
                    defaultValue={mode}
                    options={modeOptions}
                    onChange={(value) => onModeChange?.(value)}
                />
            )}
        </div>
    );
}
