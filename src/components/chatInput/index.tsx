import { Input as AntdInput } from 'antd';
import { TextAreaProps } from 'antd/lib/input/TextArea';
import { ArrowUpOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import './index.scss';

interface IInputProps
    extends Omit<TextAreaProps, 'value' | 'onChange' | 'onSubmit'> {
    value?: string;
    button?: {
        disabled?: boolean;
    };
    onChange?: (str?: string) => void;
    onPressShiftEnter?: TextAreaProps['onPressEnter'];
    onSubmit?: (str?: string) => void;
}

export default function ChatInput({
    onChange,
    onPressEnter,
    onPressShiftEnter,
    onSubmit,
    button,
    className,
    ...rest
}: IInputProps) {
    const disableSend = button?.disabled;

    const handleChange: TextAreaProps['onChange'] = (e) => {
        onChange?.(e.target.value);
    };

    return (
        <div className="demo__chat__textarea__container">
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
        </div>
    );
}
