'use client';

export const COLOR_SWATCHES = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

export function ColorSwatches({
    value,
    onChange,
    label = 'Renk',
}: {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}) {
    return (
        <div role="group" aria-label={label} className="flex h-9 items-center gap-1.5">
            {COLOR_SWATCHES.map((color) => (
                <button
                    key={color}
                    type="button"
                    aria-label={`${color} rengini seç`}
                    aria-pressed={value === color}
                    onClick={() => onChange(color)}
                    className={`size-6 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${value === color ? 'scale-110 border-foreground' : 'border-card'}`}
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
}
