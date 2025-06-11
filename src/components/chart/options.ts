import React from 'react';
import { renderToString } from 'react-dom/server';
import type {
    DataZoomComponentOption,
    EChartsOption,
    GridComponentOption,
    LineSeriesOption,
    SeriesOption,
    TooltipComponentOption,
    XAXisComponentOption,
} from 'echarts';
import { cloneDeep } from 'lodash';
import { isEmpty } from '../../utils';

const gap = 16;

/**
 * 默认的颜色
 */
export const COLORS = [
    '#1D78FF',
    '#11D7B2',
    '#AC9DFF',
    '#FBB310',
    '#2CCCDF',
    '#FF8FF4',
];

/**
 * 默认的 title 的配置项
 */
const TITLE: EChartsOption['title'] = {
    // 这里的位置和 Legend 的位置为镜面
    top: 0,
    left: 12,
    subtextStyle: {
        color: '#3D446E',
        lineHeight: 20,
        fontWeight: 400,
        fontSize: 12,
        // FIXME：理论上这个类型应该是支持 string 的，但目前看起来只有类型支持了而已
        width: '50%',
        overflow: 'truncate',
    },
    padding: 0,
    itemGap: 0,
};

/**
 * 默认的 Legend 的配置项
 */
const LEGEND: EChartsOption['legend'] = {
    top: 0,
    right: 12,
    icon: 'rect',
    type: 'scroll',
    width: '50%',
    padding: 0,
    itemHeight: 8,
    itemWidth: 8,
    itemGap: 8,
    textStyle: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 20,
        color: '#3D446E',
    },
};

/**
 * 默认 Tooltip 的配置项
 */
const TOOLTIP: EChartsOption['tooltip'] = {
    trigger: 'item',
    axisPointer: {
        type: 'shadow',
    },
    confine: true,
    appendToBody: true,
    borderWidth: 0,
    padding: 8,
    extraCssText: 'box-shadow: 0px 2px 8px 0px rgba(29, 120, 255, 0.15);',
};

/**
 * 默认 X 轴配置项
 */
const X_AXIS: EChartsOption['xAxis'] = {
    name: '',
    nameLocation: 'middle',
    nameGap: 30,
    nameTextStyle: {
        color: '#3D446E',
        lineHeight: 20,
        fontWeight: 400,
        fontSize: 12,
    },
    axisLabel: {
        color: '#8B8FA8',
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 20,
    },
    axisLine: {
        show: false,
    },
    axisTick: {
        alignWithLabel: true,
        lineStyle: {
            color: '#D8DAE2',
        },
    },
};

/**
 * 默认 Y 轴配置项
 */
const Y_AXIS: EChartsOption['yAxis'] = {
    axisLabel: {
        color: '#8B8FA8',
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 20,
        formatter: (value: number) => {
            const isNegative = value < 0;
            const absNum = Math.abs(value);
            if (absNum < 1000) {
                return isNegative ? `-${absNum}` : absNum.toString();
            }
            if (absNum >= 1000 && absNum < 1000000) {
                return (
                    (isNegative ? '-' : '') + (absNum / 1000).toFixed(1) + 'K'
                );
            }
            if (absNum >= 1000000 && absNum < 1000000000) {
                return (
                    (isNegative ? '-' : '') +
                    (absNum / 1000000).toFixed(1) +
                    'M'
                );
            }
            return (
                (isNegative ? '-' : '') + (absNum / 1000000000).toFixed(1) + 'B'
            );
        },
    },
    splitLine: {
        lineStyle: {
            type: 'dashed',
            width: 1,
        },
    },
    splitNumber: 3,
};

/**
 * 默认 Grid 的配置项
 */
const GRID: GridComponentOption = {
    left: gap,
    containLabel: true,
    // 这里的 top 需要增加一个 subtext 和 Legend 的高度一个偏移量
    top: gap + 10,
    right: gap,
    bottom: gap,
};

/**
 * 默认 DataZoom 的配置项
 */
const DATA_ZOOM: DataZoomComponentOption = {
    start: 93,
    end: 100,
    minSpan: 1,
    brushSelect: false,
    width: 'auto',
    right: 80,
    left: 80,
    textStyle: {
        width: 60,
        overflow: 'truncate',
    },
};

abstract class BaseOption<T> {
    public _option: EChartsOption = cloneDeep({
        title: TITLE,
        color: COLORS,
        legend: LEGEND,
        tooltip: TOOLTIP,
        grid: GRID,
        xAxis: X_AXIS,
        yAxis: {
            ...Y_AXIS,
            type: 'value',
        },
        series: [],
    });
    constructor(_options?: EChartsOption) {
        this._option = { ...this._option, ..._options };
    }
    /**
     * 设置 x 轴的数据
     */
    public xAxisData = (xAxis: string[]) => {
        this._option.xAxis = {
            ...this._option.xAxis,
            type: 'category',
            data: xAxis,
        };
        return this;
    };
    /**
     * 设置 x 轴的名称
     */
    public xAxisName = (name: string) => {
        this._option.xAxis = {
            ...this._option.xAxis,
            type: 'category',
            name,
        };
        // 如果设置了 x 轴的名称，则需要把 grid 的 bottom 上移腾出空间
        (this._option.grid as GridComponentOption).bottom = gap * 2;
        return this;
    };
    /**
     * 设置 subtext
     */
    public subtext = (name: string) => {
        this._option.title = {
            ...this._option.title,
            subtext: name,
        };
        return this;
    };
    /**
     * 设置 axisPointer
     * @todo option 类型应为：XAXisComponentOption['axisPointer']
     */
    public axisPointer = (option: any) => {
        this._option.xAxis = {
            ...this._option.xAxis,
            axisPointer: {
                ...(this._option.xAxis as XAXisComponentOption).axisPointer,
                ...option,
            },
        };
        this._option.tooltip = {
            ...this._option.tooltip,
            axisPointer: {
                ...(this._option.tooltip as TooltipComponentOption).axisPointer,
                ...option,
            },
        };
        return this;
    };
    /**
     * 设置 series
     * @override
     */
    public series = (_data: T[]) => {
        return this;
    };
    /**
     * 设置 legend
     */
    public legend = (legendOption: EChartsOption['legend']) => {
        this._option.legend = { ...LEGEND, ...legendOption };
        return this;
    };
    /**
     * 设置 tooltip
     */
    public tooltip = (tooltipOption: EChartsOption['tooltip']) => {
        this._option.tooltip = { ...this._option.tooltip, ...tooltipOption };
        return this;
    };

    /**
     * 设置 dataZoom
     */
    public dataZoom = (dataZoomOption: DataZoomComponentOption) => {
        this._option.dataZoom = dataZoomOption;
        return this;
    };
    /**
     * 设置 formatterTooltip
     */
    public formatterTooltip = (
        cb: (
            params: Object | Array<any>,
            series: SeriesOption[]
        ) => React.ReactElement
    ) => {
        this._option.tooltip = {
            ...this._option.tooltip,
            formatter: (params) =>
                renderToString(
                    cb(params, this._option.series as SeriesOption[])
                ),
        };
        return this;
    };

    /**
     * 设置性能优化相关的内容
     */
    public performance = (enable: boolean) => {
        if (enable) {
            this._option.animation = false;
            this._option.animationThreshold = 500;

            // 如果开启了 dataZoom 的功能，则需要增加一个 grid 的 bottom 偏移量
            this.dataZoom(DATA_ZOOM);
            const grid = this._option.grid as GridComponentOption;
            (grid.bottom as number) += 30;
        }
        return this;
    };
    /**
     * 获取配置项
     */
    public getOption = () => {
        return this._option;
    };
}

export function getBarOptionTemplate() {
    return new (class BarOptionTemplate extends BaseOption<{
        data: number[];
        name: string;
    }> {
        /**
         * 设置 series
         * @override
         */
        public series = (data: { data: number[]; name: string }[]) => {
            this._option.series = data.map((i) => ({
                data: i.data,
                type: 'bar',
                name: i.name,
            }));
            return this;
        };
    })();
}

export function getLineOptionTemplate() {
    return new (class LineOptionTemplate extends BaseOption<LineSeriesOption> {
        constructor() {
            super({
                tooltip: {
                    ...TOOLTIP,
                    trigger: 'axis',
                },
            });
        }
        /**
         * 设置 series
         * @override
         */
        public series = (data: LineSeriesOption[]) => {
            this._option.series = data.map((i) => ({
                type: 'line',
                smooth: true,
                symbol: (value, params) => {
                    // 如果当前值为空值，默认不展示 symbol
                    if (isEmpty(value)) return 'none';
                    const index = params.dataIndex;
                    const data = i.data;
                    // 如果当前值的前后均为空值，则表示当前值无法和其他值连成线，则展示空心点
                    if (isEmpty(data?.[index - 1]) && isEmpty(data?.[index + 1]))
                        return 'emptyCircle';
                    return 'none';
                },
                ...i,
            }));
            return this;
        };
    })();
}