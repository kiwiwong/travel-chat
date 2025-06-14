import { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { IMarker } from '../../types';

import './index.scss';

interface IMapContainerProps {
    markers: IMarker[];
}

export default function MapContainer({ markers }: IMapContainerProps) {
    const AMapRef = useRef<any>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        const mapMarkers: any[] = [];

        if (!AMapRef.current || !mapRef.current) {
            (window as any)._AMapSecurityConfig = {
                securityJsCode: '0a8cae0e6d717354129aa949a49e6daa',
            };

            AMapLoader.load({
                key: 'e33cc6084acfebd19c539fa33185f5b1', // 申请好的Web端开发者Key，首次调用 load 时必填
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
                        // 转换坐标
                        // AMap.convertFrom(
                        //     [m.lng, m.lat],
                        //     'baidu',
                        //     function (status: any, result: any) {
                        //         if (
                        //             status === 'complete' &&
                        //             result.info === 'ok'
                        //         ) {
                        //             const lnglats = result.locations;
                        //             const marker = new AMapRef.current.Marker({
                        //                 position: lnglats[0],
                        //                 title: m.label || 'this is title',
                        //                 label: {
                        //                     content: m.label || 'this is label',
                        //                 },
                        //             });
                        //             mapMarkers.push(marker);
                        //             mapRef.current.add(marker);
                        //         }
                        //     }
                        // );

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
                        // mapRef.current.setCenter([
                        //     mapMarkers[0].getPosition().lng,
                        //     mapMarkers[0].getPosition().lat,
                        // ]);
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
                // mapRef.current.setCenter([
                //     mapMarkers[0].getPosition().lng,
                //     mapMarkers[0].getPosition().lat,
                // ]);
            }
        }

        return () => {
            if (mapMarkers.length > 0) {
                mapRef.current.remove(mapMarkers);
            }
        };
    }, [markers]);

    return <div id="mapContainer" style={{ height: '100%' }}></div>;
}
