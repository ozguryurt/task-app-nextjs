'use client';

import { useState } from 'react';
import { useCreateTeam } from '@/lib/hooks/use-create-team';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateTeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateTeamDialog({ open, onOpenChange, onSuccess }: CreateTeamDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { createTeam, isSubmitting } = useCreateTeam();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createTeam({ name, description });
            setName('');
            setDescription('');
            onOpenChange(false);
            onSuccess?.();
        } catch (err) {
            // Hata hook tarafında toast bildirimi olarak gösterilir
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Yeni Takım Oluştur</DialogTitle>
                        <DialogDescription>
                            Yeni bir takım oluşturun ve ekip arkadaşlarınızı ekleyin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">Takım Adı *</Label>
                            <Input
                                id="team-name"
                                placeholder="Örn: Geliştirme Ekibi"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="team-description">Açıklama</Label>
                            <Textarea
                                id="team-description"
                                placeholder="Takım hakkında kısa bir açıklama..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !name.trim()}>
                            {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

