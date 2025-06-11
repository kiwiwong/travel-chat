import { useEffect, useRef } from 'react';
import type { EChartsOption } from 'echarts';
import { BarChart, LineChart } from 'echarts/charts';
import {
    DataZoomComponent,
    GridComponent,
    LegendComponent,
    LegendScrollComponent,
    MarkPointComponent,
    TitleComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { cloneDeep, get, set } from 'lodash';

import useDebounce from '../../../hooks/useDebounce';
import useMeasure from '../../../hooks/useMeasure';

const gap = 16;

export interface IBaseChartProps {
    className?: string;
    option: EChartsOption;
    /**
     * 是否在 resize 的时候开启懒更新
     */
    lazyUpdate?: boolean;
    /**
     * @reference https://echarts.apache.org/zh/api.html#echartsInstance.showLoading
     */
    loading?: boolean | object;
    onChartReady?: (instance?: echarts.ECharts) => void;
}

echarts.use([
    LineChart,
    BarChart,
    LegendScrollComponent,
    GridComponent,
    TitleComponent,
    CanvasRenderer,
    LegendComponent,
    TooltipComponent,
    MarkPointComponent,
    DataZoomComponent,
]);

export default function BaseChart({
    className,
    option,
    loading = false,
    lazyUpdate,
    onChartReady,
}: IBaseChartProps) {
    const [ref, rect, getEle] = useMeasure<HTMLDivElement>();
    const instance = useRef<echarts.ECharts | undefined>(undefined);

    function dynamicTitleWidth(option: EChartsOption) {
        // 支持 title 的动态 width 的写法
        const titleWidth = get(option, ['title', 'subtextStyle', 'width']);
        if (typeof titleWidth === 'string' && titleWidth.endsWith('%')) {
            const value =
                ((rect.width - gap * 2) * parseFloat(titleWidth)) / 100;
            return set(
                cloneDeep(option),
                ['title', 'subtextStyle', 'width'],
                value
            );
        }
        return option;
    }

    const renderChart = () => {
        const dom = getEle();
        if (!dom) return;
        let echartsInstance = echarts.getInstanceByDom(dom);
        if (!echartsInstance) {
            echartsInstance = echarts.init(dom, null, { devicePixelRatio: 2 });
        }
        const showLoading = loading !== false;
        const loadingOption = typeof loading === 'object' ? loading : {};
        if (!(option?.['series'] as any[])?.[0]?.data?.length && showLoading) {
            return echartsInstance.showLoading('default', loadingOption);
        }
        echartsInstance.hideLoading();
        echartsInstance.setOption(dynamicTitleWidth(option));
        const isFunction = typeof onChartReady === 'function';
        isFunction && onChartReady(echartsInstance);
        instance.current = echartsInstance;
    };

    const debouncePerformResize = useDebounce(() => {
        instance.current?.resize();
        const next = dynamicTitleWidth(option);
        // Resize 的时候只更新 title，防止 dataZoom 复位
        instance.current?.setOption({ title: next.title });
    }, 300);

    useEffect(() => {
        debouncePerformResize();
        // 如果目前没有开启懒更新，则直接 flush 一次
        if (!lazyUpdate) {
            debouncePerformResize.flush();
        }
    }, [rect.width, rect.height]);

    useEffect(() => {
        debouncePerformResize.cancel();
    }, [lazyUpdate]);

    useEffect(() => {
        renderChart();

        return () => {
            instance.current?.dispose();
        };
    }, [option, getEle()]);

    return (
        <div
            style={{ width: '100%', height: '100%', overflow: 'hidden' }}
            className={className}
            ref={ref}
        />
    );
}
