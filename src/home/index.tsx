import { useState } from 'react';
// import { SettingOutlined } from '@ant-design/icons';
import AIChat from '../components/AIChat';
import SettingModal from '../components/settingModal';
import MapContainer from '../components/mapContainer';
import { IMarker } from '../types';

// 杭州东站,杭州西站,杭州南站,铜鉴湖公园

export default function Home() {
    const [visible, setVisible] = useState(false);
    const [markers, setMarkers] = useState<IMarker[]>([]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
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
                    style={{ fontSize: 14, color: '#1c1e21', fontWeight: 600 }}
                >
                    旅游规划助手
                </span>
                {/* <SettingOutlined
                    onClick={() => setVisible(true)}
                    style={{ fontSize: 16, cursor: 'pointer' }}
                /> */}
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
                <AIChat
                    style={{ flex: 1, height: '100%', padding: '24px' }}
                    updateMarkers={(markers) => setMarkers(markers)}
                />
                <div
                    style={{
                        flex: 1,
                        height: '100%',
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                        borderLeft: '1px solid #ebecf0',
                        overflow: 'hidden',
                    }}
                >
                    <MapContainer markers={markers} />
                </div>
            </div>
            <SettingModal
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
            />
        </div>
    );
}
