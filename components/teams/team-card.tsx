'use client';

import Link from 'next/link';
import { Team } from '@/lib/store/team-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';

interface TeamCardProps {
    team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
    return (
        <Link href={`/dashboard/teams/${team.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <CardDescription className="mt-1">
                                {team.description || 'Açıklama yok'}
                            </CardDescription>
                        </div>
                        <Badge variant={team.user_role === 'admin' ? 'default' : 'secondary'}>
                            {team.user_role === 'admin' ? 'Yönetici' : 'Üye'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{team.member_count} üye</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(team.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

