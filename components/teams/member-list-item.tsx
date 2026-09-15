'use client';

import { useState } from 'react';
import { TeamMember } from '@/lib/store/team-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2, Mail, CheckCircle2, XCircle } from 'lucide-react';

interface MemberListItemProps {
    member: TeamMember;
    isAdmin: boolean;
    currentUserId: number;
    onRoleChange: (memberId: number, role: 'admin' | 'member') => Promise<boolean>;
    onRemove: (memberId: number, memberName: string) => void;
    isUpdating: boolean;
}

export function MemberListItem({
    member,
    isAdmin,
    currentUserId,
    onRoleChange,
    onRemove,
    isUpdating
}: MemberListItemProps) {
    const [isChangingRole, setIsChangingRole] = useState(false);
    const isCurrentUser = member.user_id === currentUserId;

    const handleRoleChange = async (newRole: string) => {
        if (newRole === member.role) return;

        setIsChangingRole(true);
        try {
            await onRoleChange(member.id, newRole as 'admin' | 'member');
        } finally {
            setIsChangingRole(false);
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60">
            <div className="flex items-center gap-3 flex-1">
                <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                    <span className="text-xs font-bold">
                        {member.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">Sen</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span>{member.email}</span>
                        {member.email_verified ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isAdmin && !isCurrentUser ? (
                    <>
                        <Select
                            value={member.role}
                            onValueChange={handleRoleChange}
                            disabled={isChangingRole || isUpdating}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Üye</SelectItem>
                                <SelectItem value="admin">Yönetici</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(member.id, member.name)}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role === 'admin' ? 'Yönetici' : 'Üye'}
                    </Badge>
                )}
            </div>
        </div>
    );
}

