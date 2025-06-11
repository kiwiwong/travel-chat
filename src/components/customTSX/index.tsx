import { BarChart } from '../barChart';
import { LineChart } from '../lineChart';

type RehypeNode = {
    type: string;
    children: RehypeNode[];
    value: string;
};

interface ICustomTSXProps {
    type: string;
    data: RehypeNode;
}

enum CustomType {
    BAR_CHART = 'BAR_CHART',
    LINE_CHART = 'LINE_CHART',
}

function getText(data: RehypeNode): string {
    if (data.type === 'text') return data.value;
    return data.children.map(getText).join('');
}

export default function CustomTSX({ type, data }: ICustomTSXProps) {
    if (!type) return null;
    const children = getText(data);
    const chartData = (() => {
        try {
            return JSON.parse(children.toString());
        } catch {
            return undefined;
        }
    })();

    switch (type) {
        case CustomType.BAR_CHART: {
            return (
                <div key={children.toString()} style={{ height: 320 }}>
                    <BarChart data={chartData} />
                </div>
            );
        }
        case CustomType.LINE_CHART: {
            return (
                <div key={children.toString()} style={{ height: 320 }}>
                    <LineChart data={chartData} />
                </div>
            );
        }
        default:
            break;
    }
}
