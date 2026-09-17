import { z } from 'zod';

const optionalDate = z.union([
    z.literal(''),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih biçimi'),
    z.null(),
]).optional();

const taskFields = {
    assigned_to: z.coerce.number().int().positive(),
    title: z.string().trim().min(1, 'Görev başlığı zorunludur').max(255, 'Görev başlığı çok uzun'),
    description: z.string().max(10_000, 'Görev açıklaması çok uzun').nullable().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    priority: z.enum(['low', 'medium', 'high']),
    start_date: optionalDate,
    end_date: optionalDate,
    due_date: optionalDate,
};

export const createTaskSchema = z.object({
    ...taskFields,
    status: taskFields.status.default('pending'),
    priority: taskFields.priority.default('medium'),
}).strict();

export const updateTaskSchema = z.object(taskFields).partial().strict();
