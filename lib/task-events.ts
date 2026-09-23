export const TASKS_CHANGED_EVENT = 'taskflow:tasks-changed';

export function notifyTasksChanged() {
    window.dispatchEvent(new Event(TASKS_CHANGED_EVENT));
}
