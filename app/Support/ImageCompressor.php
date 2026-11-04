<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

/**
 * Safety net behind the CMS's in-browser compression: a JPEG photo that still arrives above 900 KB is scaled to at
 * most 2560px on its longest side and saved at the best quality that fits. Needs PHP's GD extension; without it,
 * or for other formats, the file is kept as uploaded.
 */
class ImageCompressor
{
    public const LIMIT = 900 * 1024;

    private const MAX_SIDE = 2560;

    public static function shrink(UploadedFile $file): void
    {
        $path = $file->getRealPath();
        if (! $path || $file->getSize() <= self::LIMIT || ! function_exists('imagecreatefromjpeg')
            || ! in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg'], true)) {
            return;
        }
        $src = @imagecreatefromjpeg($path);
        if (! $src) {
            return;
        }
        [$w, $h] = [imagesx($src), imagesy($src)];
        $scale = min(1, self::MAX_SIDE / max($w, $h));
        $best = null;
        for ($round = 0; $round < 5 && ! ($best !== null && strlen($best) <= self::LIMIT); $round++) {
            $img = imagecreatetruecolor((int) round($w * $scale), (int) round($h * $scale));
            imagecopyresampled($img, $src, 0, 0, 0, 0, imagesx($img), imagesy($img), $w, $h);
            foreach ([88, 82, 76, 70] as $q) {
                ob_start();
                imagejpeg($img, null, $q);
                $data = ob_get_clean();
                if ($best === null || strlen($data) < strlen($best)) {
                    $best = $data;
                }
                if (strlen($data) <= self::LIMIT) {
                    break;
                }
            }
            imagedestroy($img);
            $scale *= 0.85;
        }
        imagedestroy($src);
        if ($best !== null && strlen($best) < $file->getSize()) {
            file_put_contents($path, $best);
            clearstatcache(true, $path);
        }
    }
}
