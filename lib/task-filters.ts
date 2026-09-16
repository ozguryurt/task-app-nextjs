export type TaskStatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriorityFilter = 'all' | 'low' | 'medium' | 'high';
export type TaskSort = 'newest' | 'oldest' | 'due_soon' | 'priority';

export interface TaskFilterState {
    query: string;
    status: TaskStatusFilter;
    priority: TaskPriorityFilter;
    assignedTo: string;
    sort: TaskSort;
}

export const defaultTaskFilters: TaskFilterState = {
    query: '',
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    sort: 'newest',
};

interface FilterableTask {
    assigned_to: number;
    title: string;
    description: string | null;
    status: Exclude<TaskStatusFilter, 'all'>;
    priority: Exclude<TaskPriorityFilter, 'all'>;
    due_date: string | null;
    created_at: string;
}

const priorityRank: Record<Exclude<TaskPriorityFilter, 'all'>, number> = {
    low: 1,
    medium: 2,
    high: 3,
};

function dateValue(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? fallback : time;
}

export function filterTasks<T extends FilterableTask>(
    tasks: T[],
    filters: TaskFilterState,
    extraSearchText?: (task: T) => string
): T[] {
    const query = filters.query.trim().toLocaleLowerCase('tr-TR');

    return tasks
        .filter((task) => {
            if (filters.status !== 'all' && task.status !== filters.status) return false;
            if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
            if (filters.assignedTo !== 'all' && String(task.assigned_to) !== filters.assignedTo) return false;
            if (!query) return true;

            const searchableText = [
                task.title,
                task.description ?? '',
                extraSearchText?.(task) ?? '',
            ].join(' ').toLocaleLowerCase('tr-TR');

            return searchableText.includes(query);
        })
        .sort((a, b) => {
            switch (filters.sort) {
                case 'oldest':
                    return dateValue(a.created_at, 0) - dateValue(b.created_at, 0);
                case 'due_soon':
                    return dateValue(a.due_date, Number.POSITIVE_INFINITY) -
                        dateValue(b.due_date, Number.POSITIVE_INFINITY);
                case 'priority':
                    return priorityRank[b.priority] - priorityRank[a.priority] ||
                        dateValue(b.created_at, 0) - dateValue(a.created_at, 0);
                default:
                    return dateValue(b.created_at, 0) - dateValue(a.created_at, 0);
            }
        });
}

export function hasActiveTaskFilters(filters: TaskFilterState): boolean {
    return filters.query.trim() !== '' || filters.status !== 'all' ||
        filters.priority !== 'all' || filters.assignedTo !== 'all' || filters.sort !== 'newest';
}
