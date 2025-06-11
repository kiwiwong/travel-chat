import BarChart from './bar';
import LineChart from './line';
import { COLORS, getBarOptionTemplate, getLineOptionTemplate } from './options';

/**
 * @description 从指标 release_6.2.x 同步过来，只保留了需要的部分
 */
export const Chart = {
    Line: LineChart,
    Bar: BarChart,

    COLORS,
    OPTIONS: {
        bar: getBarOptionTemplate,
        line: getLineOptionTemplate,
    },
};
