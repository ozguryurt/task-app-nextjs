export interface CalendarDay {
    date: Date;
    key: string;
    isCurrentMonth: boolean;
    isToday: boolean;
}

export function toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function taskDateKey(value: string | null): string | null {
    if (!value) return null;
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match?.[1] ?? null;
}

export function createMonthGrid(month: Date, today = new Date()): CalendarDay[] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(year, monthIndex, 1 - mondayOffset);
    const todayKey = toLocalDateKey(today);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        const key = toLocalDateKey(date);

        return {
            date,
            key,
            isCurrentMonth: date.getMonth() === monthIndex,
            isToday: key === todayKey,
        };
    });
}
