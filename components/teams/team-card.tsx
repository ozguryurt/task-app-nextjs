'use client';

import Link from 'next/link';
import { Team } from '@/lib/store/team-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, ArrowUpRight } from 'lucide-react';

interface TeamCardProps {
    team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
    return (
        <Link href={`/panel/takimlar/${team.id}`} className="block h-full">
            <Card className="group h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-primary/15 hover:shadow-xl">
                <CardHeader className="pb-1">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-base">{team.name}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2 leading-5">
                                {team.description || 'Açıklama yok'}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className={team.user_role === 'admin' ? 'bg-primary/10 text-primary' : ''}>
                            {team.user_role === 'admin' ? 'Yönetici' : 'Üye'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="mt-auto">
                    <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{team.member_count} üye</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(team.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

