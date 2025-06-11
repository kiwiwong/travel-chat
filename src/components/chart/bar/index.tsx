import BaseChart, { IBaseChartProps } from '../base';

interface IBarChartProps extends IBaseChartProps {}

export default function BarChart({ ...rest }: IBarChartProps) {
    return <BaseChart {...rest} />;
}
