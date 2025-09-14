

export function hasFunctionInAbi(abi: any[], functionName: string): boolean {
    return abi.some(item =>
        item.type === 'function' &&
        item.name === functionName
    );
}