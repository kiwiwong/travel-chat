import { useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import AIChat from '../components/AIChat';
import SettingModal from '../components/settingModal';

export default function Home() {
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 46,
                    borderBottom: '1px solid #ebecf0',
                    padding: '0 24px',
                }}
            >
                <span
                    style={{ fontSize: 14, color: '#3D446E', fontWeight: 600 }}
                >
                    智能问答
                </span>
                <SettingOutlined
                    onClick={() => setVisible(true)}
                    style={{ fontSize: 16, cursor: 'pointer' }}
                />
            </div>
            <AIChat />
            <SettingModal
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
            />
        </div>
    );
}
