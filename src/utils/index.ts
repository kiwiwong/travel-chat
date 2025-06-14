/**
 * @description 从 dt-utils 中同步过来
 */
export function isEmpty(data?: any) {
    if (data === '') return true;
    if (data === null) return true;
    if (data === undefined) return true;
    if (Array.prototype.isPrototypeOf(data) && data.length === 0) return true;
    if (Object.prototype.isPrototypeOf(data) && Object.keys(data).length === 0)
        return true;
    return false;
}

export function convertFileToBase64(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

export function extractAndRemoveAllTSX<T>(input: string): {
    json: T[];
    str: string;
} {
    const tsxRegex = /<TSX>([\s\S]*?)<\/TSX>/g;
    const allJson: T[] = [];
    let match: RegExpExecArray | null;
    let cleanedStr = input;

    // 使用正则全局匹配所有<TSX>标签中的内容
    while ((match = tsxRegex.exec(input)) !== null) {
        const jsonContent = match[1];
        try {
            const parsed = JSON.parse(jsonContent) as T;
            if (Array.isArray(parsed)) {
                allJson.push(...parsed);
            } else {
                allJson.push(parsed);
            }
        } catch (err) {
            console.error('JSON 解析错误:', err);
        }
    }

    // 移除所有<TSX>...</TSX>标签内容
    cleanedStr = cleanedStr.replace(tsxRegex, '');

    return {
        json: allJson,
        str: cleanedStr,
    };
}
