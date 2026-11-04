import axios from 'axios';

/** Photos above this size are made smaller in the browser before they are sent, so the server never rejects them. */
export const COMPRESS_ABOVE = 900 * 1024;
const MAX_SIDE = 2560; // plenty for a full-screen hero on a large screen

export type UploadStage =
    | { stage: 'compressing'; index: number; total: number; name: string }
    | { stage: 'uploading'; percent: number; saved?: string }
    | { stage: 'done'; saved?: string };

export const formatBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const canCompress = (f: File) => /^image\/(jpeg|png|webp)$/.test(f.type) && f.size > COMPRESS_ABOVE;

const encode = (canvas: HTMLCanvasElement, type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Re-encodes a large photo at the best quality that fits under COMPRESS_ABOVE: first only lowering the JPEG/WebP
 * quality a little at a time, then (only if needed) the size in steps. Photos with transparency stay WebP so the
 * clear areas are kept. Anything that can't be made smaller is sent as it was.
 */
export async function compressImage(file: File): Promise<File> {
    if (!canCompress(file)) return file;
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file;
    }
    const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
    let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    let best: Blob | null = null;
    // Try a few qualities at this size; if even the lowest is too heavy, shrink by about the needed amount and retry.
    for (let round = 0; round < 4 && !(best && best.size <= COMPRESS_ABOVE); round++) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) break;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        let smallest: Blob | null = null;
        for (const q of [0.88, 0.8, 0.72]) {
            const blob = await encode(canvas, type, q);
            if (!blob) continue;
            if (!smallest || blob.size < smallest.size) smallest = blob;
            if (blob.size <= COMPRESS_ABOVE) break;
        }
        if (smallest && (!best || smallest.size < best.size)) best = smallest;
        if (smallest) scale *= Math.min(0.9, Math.sqrt(COMPRESS_ABOVE / smallest.size) * 0.95);
    }
    bitmap.close();
    if (!best || best.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + (type === 'image/jpeg' ? '.jpg' : '.webp');
    return new File([best], name, { type, lastModified: Date.now() });
}

/** Compresses large photos, then uploads everything to the media library, reporting each step. Returns the new URLs. */
export async function uploadMedia(files: File[], onStage: (s: UploadStage) => void): Promise<string[]> {
    const ready: File[] = [];
    let before = 0, after = 0;
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (canCompress(f)) {
            onStage({ stage: 'compressing', index: i + 1, total: files.length, name: f.name });
            const c = await compressImage(f);
            before += f.size; after += c.size;
            ready.push(c);
        } else {
            ready.push(f);
        }
    }
    const saved = before > after ? `${formatBytes(before)} → ${formatBytes(after)}` : undefined;
    const fd = new FormData();
    ready.forEach((f) => fd.append('files[]', f));
    onStage({ stage: 'uploading', percent: 0, saved });
    const r = await axios.post<{ urls: string[] }>('/admin/media', fd, {
        headers: { Accept: 'application/json' },
        onUploadProgress: (e) => onStage({ stage: 'uploading', percent: e.total ? Math.round((e.loaded / e.total) * 100) : 0, saved }),
    });
    onStage({ stage: 'done', saved });
    return r.data.urls;
}
