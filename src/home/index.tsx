import { useState } from 'react';
import AIChat from '../components/AIChat';
import MapContainer from '../components/mapContainer';
import { IMarker } from '../types';

import './index.scss';

export default function Home() {
    const [markers, setMarkers] = useState<IMarker[]>([]);

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
                    updateMarkers={(markers) => setMarkers(markers)}
                />
                <div className="home__map">
                    <MapContainer markers={markers} />
                </div>
            </div>
        </div>
    );
}
