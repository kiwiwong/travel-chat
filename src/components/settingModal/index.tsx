import { useEffect } from 'react';
import { Modal, Input, Form, Switch } from 'antd';
import { getConfig, setConfig } from '../../utils/config';

interface IProps {
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
}

export default function SettingModal({ visible, onOk, onCancel }: IProps) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            const { API_URL, API_KEY, ENABLE_UPLOAD_FILE, ENABLE_SELECT_MODE } =
                getConfig() || {};
            form.setFieldsValue({
                api_url: API_URL,
                api_key: API_KEY,
                upload_file: ENABLE_UPLOAD_FILE,
                select_mode: ENABLE_SELECT_MODE,
            });
        }
    }, [visible]);

    const onSubmit = async () => {
        const values = await form.validateFields();
        setConfig({
            API_URL: values.api_url,
            API_KEY: values.api_key,
            ENABLE_UPLOAD_FILE: values.upload_file,
            ENABLE_SELECT_MODE: values.select_mode,
        });
        location.reload();
        onOk?.();
    };

    return (
        <Modal
            title="编辑应用"
            visible={visible}
            onOk={() => onSubmit()}
            onCancel={onCancel}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="API_URL"
                    name="api_url"
                    rules={[{ required: true, message: '请输入 API_URL' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="API_KEY"
                    name="api_key"
                    rules={[{ required: true, message: '请输入 API_KEY' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="文件上传"
                    name="upload_file"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label="模式选择"
                    name="select_mode"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
}
