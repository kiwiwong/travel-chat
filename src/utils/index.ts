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
