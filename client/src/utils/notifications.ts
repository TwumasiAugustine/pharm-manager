/**
 * Function to convert a duration to the nearest predefined CSS class
 * @param duration Duration in milliseconds
 * @returns CSS class name for that duration
 */
export const getDurationClass = (duration: number): string => {
    const predefinedDurations = [3000, 5000, 8000];

    // Find the closest predefined duration
    const closest = predefinedDurations.reduce((prev, curr) => {
        return Math.abs(curr - duration) < Math.abs(prev - duration)
            ? curr
            : prev;
    }, predefinedDurations[0]);

    return `notification-duration-${closest}`;
};
