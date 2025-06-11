import BaseChart, { IBaseChartProps } from '../base';

interface ILineChartProps extends IBaseChartProps {}

export default function LineChart({ ...rest }: ILineChartProps) {
    return <BaseChart {...rest} />;
}
