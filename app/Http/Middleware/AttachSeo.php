<?php

namespace App\Http\Middleware;

use App\Support\Seo;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Adds the page's search & share tags to Inertia visits (page-to-page navigation), so the browser tab and tags stay
 * right after the first load. The first load gets the same tags straight in the HTML (resources/views/app.blade.php).
 */
class AttachSeo
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($request->header('X-Inertia') && ! $request->header('X-Inertia-Partial-Data') && $response instanceof JsonResponse) {
            $page = $response->getData(true);
            if (isset($page['component'])) {
                $page['props']['seo'] = Seo::fromPage($page);
                $response->setData($page);
            }
        }

        return $response;
    }
}
