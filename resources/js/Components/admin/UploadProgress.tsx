import Icon from '@/Components/Icon';
import type { UploadStage } from '@/lib/upload';

/** The step an upload is on: "Compressing your image…" for large photos, then "Uploading…" with a bar, then done. */
export default function UploadProgress({ stage }: { stage: UploadStage | null }) {
    if (!stage) return null;
    const compressing = stage.stage === 'compressing';
    const percent = stage.stage === 'uploading' ? stage.percent : stage.stage === 'done' ? 100 : null;
    const label = compressing
        ? (stage.total > 1 ? `Compressing image ${stage.index} of ${stage.total}…` : 'Compressing your image…')
        : stage.stage === 'uploading' ? `Uploading… ${stage.percent}%` : 'Upload complete';
    const saved = stage.stage !== 'compressing' ? stage.saved : undefined;

    return (
        <div role="status" aria-live="polite" className="w-full max-w-sm text-left">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
                {stage.stage === 'done'
                    ? <Icon name="check" size={16} className="text-forest-700" />
                    : <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />}
                <span>{label}</span>
            </div>
            {compressing && <p className="mt-1 truncate text-xs text-ink/50">{stage.name}: making it lighter while keeping the best quality</p>}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div className={percent === null ? 'h-full w-1/3 animate-[upload-slide_1.1s_ease-in-out_infinite] rounded-full bg-gold' : 'h-full rounded-full bg-gold transition-[width] duration-300'}
                    style={percent === null ? undefined : { width: `${percent}%` }} />
            </div>
            {saved && <p className="mt-1 text-xs text-ink/50">Compressed {saved}</p>}
        </div>
    );
}
