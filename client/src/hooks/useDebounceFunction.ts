import { useDebounce } from './useDebounce';

/**
 * Custom hook for creating a debounced function
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the function
 */
export function useDebounceFunction<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
): (...args: Parameters<T>) => void {
    const debouncedFunc = useDebounce(func, delay);
    return debouncedFunc;
}
