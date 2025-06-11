import { useMemo, memo } from 'react';
import { isEqual } from 'lodash';
import { Chart } from '../chart';

function getSeries(data: any[]): { data: number[]; name: string }[] {
    return data.map((i) => ({
        name: i.label,
        data: i.value,
    }));
}

export const LineChart = memo(
    ({ data }: any) => {
        if (!data) return null;

        const option = useMemo(() => {
            return Chart.OPTIONS.line()
                .xAxisData(data.xAxis)
                .series(getSeries(data.yAxis))
                .getOption();
        }, [data]);

        return <Chart.Bar option={option} />;
    },
    (prev, next) => {
        return isEqual(prev.data, next.data);
    }
);
