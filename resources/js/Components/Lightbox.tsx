import { useEffect } from 'react';
import Icon from '@/Components/Icon';
import { img } from '@/lib/utils';

export default function Lightbox({ images, index, onClose, onIndex }: { images: string[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
    useEffect(() => {
        if (index === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onIndex((index + 1) % images.length);
            if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [index, images.length, onClose, onIndex]);

    if (index === null) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur" onClick={onClose} role="dialog" aria-modal>
            <button className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-none border border-white/20 text-white hover:bg-white hover:text-ink" aria-label="Close"><Icon name="close" /></button>
            <button onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + images.length) % images.length); }} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-none border border-white/20 text-white hover:bg-white hover:text-ink" aria-label="Previous"><Icon name="chevronLeft" /></button>
            <img src={img(images[index], 2000, 80)} alt="" className="max-h-[86vh] max-w-full object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % images.length); }} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-none border border-white/20 text-white hover:bg-white hover:text-ink" aria-label="Next"><Icon name="chevronRight" /></button>
            <p className="absolute bottom-6 text-xs uppercase tracking-[0.3em] text-white/60">{index + 1} / {images.length}</p>
        </div>
    );
}
