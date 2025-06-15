import { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { IMarker } from '../../types';

import './index.scss';

const gaodeKey = import.meta.env.VITE_GAODE_MAP_KEY;
const gaodeSecretCode = import.meta.env.VITE_GAODE_MAP_SECRET_CODE;

interface IMapContainerProps {
    markers: IMarker[];
    className?: string;
}

export default function MapContainer({
    markers,
    className,
}: IMapContainerProps) {
    const AMapRef = useRef<any>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        const mapMarkers: any[] = [];

        if (!AMapRef.current || !mapRef.current) {
            (window as any)._AMapSecurityConfig = {
                securityJsCode: gaodeSecretCode,
            };

            AMapLoader.load({
                key: gaodeKey, // 申请好的Web端开发者Key，首次调用 load 时必填
                version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: ['AMap.Scale'], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
            })
                .then((AMap) => {
                    AMapRef.current = AMap;
                    mapRef.current = new AMap.Map('mapContainer', {
                        // 设置地图容器id
                        viewMode: '3D', // 是否为3D地图模式
                        zoom: 11, // 初始化地图级别
                        center: [120.1551, 30.2741], // 初始化地图中心点位置
                    });

                    mapRef.current.addControl(new AMapRef.current.Scale());

                    markers.forEach((m) => {
                        const marker = new AMapRef.current.Marker({
                            position: [m.long, m.lat],
                            title: m.name || 'this is title',
                            label: {
                                content: m.name || 'this is label',
                            },
                        });
                        mapMarkers.push(marker);
                    });

                    if (mapMarkers.length > 0) {
                        mapRef.current.add(mapMarkers);
                        mapRef.current.setFitView(
                            null,
                            false,
                            [150, 100, 100, 100],
                            13
                        );
                    }
                })
                .catch((e) => {
                    console.log(e);
                });
        } else {
            markers.forEach((m) => {
                const marker = new AMapRef.current.Marker({
                    position: [m.long, m.lat],
                    title: m.name || 'this is title',
                    label: {
                        content: m.name || 'this is label',
                    },
                });
                mapMarkers.push(marker);
            });

            if (mapMarkers.length > 0) {
                mapRef.current.add(mapMarkers);
                mapRef.current.setFitView(
                    null,
                    false,
                    [150, 100, 100, 100],
                    13
                );
            }
        }

        return () => {
            if (mapMarkers.length > 0) {
                mapRef.current.remove(mapMarkers);
            }
        };
    }, [markers]);

    return <div id="mapContainer" className={className}></div>;
}
