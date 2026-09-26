import type { PoolConnection } from 'mysql2/promise';

export type TaskActivityType = 'created' | 'updated' | 'commented' | 'comment_deleted';
export type NotificationType = 'assigned' | 'reassigned' | 'comment' | 'mention' | 'status_changed' | 'due_soon' | 'overdue';

export function auditValue(value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return String(value);
}

export async function recordTaskActivity(
    connection: PoolConnection,
    taskId: number,
    actorId: number,
    eventType: TaskActivityType,
    fieldName: string | null = null,
    oldValue: unknown = null,
    newValue: unknown = null
) {
    await connection.query(
        `INSERT INTO task_activity (task_id, actor_id, event_type, field_name, old_value, new_value)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [taskId, actorId, eventType, fieldName, auditValue(oldValue), auditValue(newValue)]
    );
}

export async function notifyUser(
    connection: PoolConnection,
    userId: number,
    actorId: number | null,
    teamId: number,
    taskId: number,
    type: NotificationType,
    message: string,
    dedupeKey: string | null = null
) {
    if (actorId === userId) return;
    await connection.query(
        `INSERT INTO notifications (user_id, actor_id, team_id, task_id, type, message, dedupe_key)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE read_at = read_at`,
        [userId, actorId, teamId, taskId, type, message.slice(0, 255), dedupeKey]
    );
}

export function findMentionedMembers(body: string, members: Array<{ user_id: number; name: string }>): number[] {
    const normalizedBody = body.toLocaleLowerCase('tr-TR');
    const found = new Set<number>();
    for (let position = 0; position < normalizedBody.length; position += 1) {
        if (normalizedBody[position] !== '@') continue;
        const before = normalizedBody[position - 1];
        if (before && !/[\s(]/u.test(before)) continue;
        let longest = 0;
        let matches: number[] = [];
        for (const member of members) {
            const mention = `@${member.name.toLocaleLowerCase('tr-TR')}`;
            if (!normalizedBody.startsWith(mention, position)) continue;
            const after = normalizedBody[position + mention.length];
            if (after && !/[\s.,!?;:)]/u.test(after)) continue;
            if (mention.length > longest) {
                longest = mention.length;
                matches = [member.user_id];
            } else if (mention.length === longest) {
                matches.push(member.user_id);
            }
        }
        for (const id of matches) found.add(id);
    }
    return [...found];
}
