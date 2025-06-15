import { useState } from 'react';
import AIChat from '../components/AIChat';
import MapContainer from '../components/mapContainer';
import { IMarker } from '../types';
import Cover from '../components/cover';
import classNames from 'classnames';

import './index.scss';

export default function Home() {
    const [markers, setMarkers] = useState<IMarker[]>([]);
    const [chatStatus, setChatStatus] = useState<
        'loading' | 'completed' | 'init'
    >('init');
    const [renderCover, setRenderCover] = useState(true);

    const handleChatStatusChange = (
        status: 'loading' | 'completed' | 'init'
    ) => {
        setChatStatus(status);

        // 延迟修改 cover 的显示状态，保证动画效果
        setTimeout(() => {
            if (status === 'completed') {
                setRenderCover(false);
            }
        }, 600);
    };

    return (
        <div className="home">
            <div className="home__header">
                <span
                    style={{ fontSize: 14, color: '#1c1e21', fontWeight: 600 }}
                >
                    旅游规划助手
                </span>
            </div>
            <div className="home__content">
                <AIChat
                    style={{ flex: 1, height: '100%' }}
                    status={chatStatus}
                    updateMarkers={(markers) => setMarkers(markers)}
                    onChatStatusChange={handleChatStatusChange}
                />
                <div className="home__map">
                    <MapContainer
                        markers={markers}
                        className={classNames({
                            'home__map--hidden': chatStatus !== 'completed',
                        })}
                    />
                    {renderCover && (
                        <Cover
                            visible={
                                chatStatus !== 'completed' ||
                                markers.length === 0
                            }
                            title={
                                chatStatus === 'loading'
                                    ? '目的地正在锁定中...'
                                    : '新的旅程，即将开始 ✈️'
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
