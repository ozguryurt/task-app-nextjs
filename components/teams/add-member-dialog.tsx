'use client';

import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (email: string, role: 'admin' | 'member') => Promise<void>;
    isSubmitting: boolean;
}

export function AddMemberDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting
}: AddMemberDialogProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member'>('member');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await onSubmit(email, role);
            setEmail('');
            setRole('member');
            onOpenChange(false);
        } catch (err) {
            // Hata parent tarafında işleniyor
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Takıma Üye Ekle</DialogTitle>
                        <DialogDescription>
                            Mevcut bir kullanıcının e-posta adresini girin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="member-email">E-posta Adresi *</Label>
                            <Input
                                id="member-email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="member-role">Rol *</Label>
                            <Select
                                value={role}
                                onValueChange={(value) => setRole(value as 'admin' | 'member')}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="member-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Üye</SelectItem>
                                    <SelectItem value="admin">Yönetici</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Yöneticiler takıma üye ekleyebilir ve çıkarabilir
                            </p>
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
                        <Button type="submit" disabled={isSubmitting || !email.trim()}>
                            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

