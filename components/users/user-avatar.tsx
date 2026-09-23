import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    name?: string | null;
    src?: string | null;
    className?: string;
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
    const initials = (name ?? 'U')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toLocaleUpperCase('tr-TR') || 'U';

    return (
        <span className={cn('relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700', className)}>
            {src ? <Image src={src} alt={`${name || 'Kullanıcı'} profil fotoğrafı`} fill sizes="80px" unoptimized className="object-cover" /> : initials}
        </span>
    );
}
