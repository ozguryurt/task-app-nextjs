'use client';

import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    defaultTaskFilters,
    hasActiveTaskFilters,
    type TaskFilterState,
    type TaskPriorityFilter,
    type TaskSort,
    type TaskStatusFilter,
} from '@/lib/task-filters';

interface TaskFilterBarProps {
    filters: TaskFilterState;
    onChange: (filters: TaskFilterState) => void;
    resultCount: number;
    totalCount: number;
    searchPlaceholder?: string;
    assignees?: Array<{ id: number; name: string }>;
}

export function TaskFilterBar({
    filters,
    onChange,
    resultCount,
    totalCount,
    searchPlaceholder = 'Görevlerde ara...',
    assignees,
}: TaskFilterBarProps) {
    const isFiltered = hasActiveTaskFilters(filters);

    return (
        <div className="motion-reveal mb-4 space-y-2.5 border-b pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <div className="relative min-w-0 flex-1 sm:min-w-52">
                    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        aria-label="Görevlerde ara"
                        placeholder={searchPlaceholder}
                        value={filters.query}
                        onChange={(event) => onChange({ ...filters, query: event.target.value })}
                        className="pl-9"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status: status as TaskStatusFilter })}>
                        <SelectTrigger aria-label="Duruma göre filtrele" className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm durumlar</SelectItem>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="in_progress">Devam ediyor</SelectItem>
                            <SelectItem value="completed">Tamamlandı</SelectItem>
                            <SelectItem value="cancelled">İptal edildi</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.priority} onValueChange={(priority) => onChange({ ...filters, priority: priority as TaskPriorityFilter })}>
                        <SelectTrigger aria-label="Önceliğe göre filtrele" className="w-full sm:w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm öncelikler</SelectItem>
                            <SelectItem value="high">Yüksek</SelectItem>
                            <SelectItem value="medium">Orta</SelectItem>
                            <SelectItem value="low">Düşük</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {assignees && assignees.length > 0 && (
                    <Select value={filters.assignedTo} onValueChange={(assignedTo) => onChange({ ...filters, assignedTo })}>
                        <SelectTrigger aria-label="Atanan kişiye göre filtrele" className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm kişiler</SelectItem>
                            {assignees.map((assignee) => (
                                <SelectItem key={assignee.id} value={String(assignee.id)}>{assignee.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Select value={filters.sort} onValueChange={(sort) => onChange({ ...filters, sort: sort as TaskSort })}>
                    <SelectTrigger aria-label="Görevleri sırala" className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">En yeni</SelectItem>
                        <SelectItem value="oldest">En eski</SelectItem>
                        <SelectItem value="due_soon">Yakın teslim</SelectItem>
                        <SelectItem value="priority">Öncelik</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex min-h-6 items-center justify-between gap-2 text-xs text-muted-foreground">
                <span aria-live="polite">{isFiltered ? `${resultCount} / ${totalCount} görev gösteriliyor` : `${totalCount} görev`}</span>
                {isFiltered && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...defaultTaskFilters })} className="h-6 px-2 text-xs">
                        <X className="size-3" /> Filtreleri temizle
                    </Button>
                )}
            </div>
        </div>
    );
}
