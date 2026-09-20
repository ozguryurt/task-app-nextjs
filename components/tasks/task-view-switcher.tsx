'use client';

import { CalendarDays, Columns3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TaskView = 'list' | 'kanban' | 'calendar';

const views: Array<{ value: TaskView; label: string; icon: typeof List }> = [
    { value: 'list', label: 'Liste', icon: List },
    { value: 'kanban', label: 'Kanban', icon: Columns3 },
    { value: 'calendar', label: 'Takvim', icon: CalendarDays },
];

export function TaskViewSwitcher({ value, onChange }: {
    value: TaskView;
    onChange: (view: TaskView) => void;
}) {
    return (
        <div className="flex rounded-md border bg-muted/45 p-0.5" role="group" aria-label="Görev görünümü">
            {views.map(({ value: view, label, icon: Icon }) => (
                <Button
                    key={view}
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-pressed={value === view}
                    onClick={() => onChange(view)}
                    className={cn(
                        'h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:translate-y-0',
                        value === view && 'bg-card text-foreground shadow-xs hover:bg-card'
                    )}
                >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                </Button>
            ))}
        </div>
    );
}
