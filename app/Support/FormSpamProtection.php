<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/** Server-side checks shared by every public form. */
class FormSpamProtection
{
    /**
     * Reject automated submissions before they are stored or trigger email.
     * Turnstile is deliberately verified here, rather than trusted from the
     * browser, because a bot can post directly to the Laravel routes.
     */
    public function assertHuman(Request $request, string $action): void
    {
        if (filled($request->input('website'))) {
            $this->blocked($request, $action, 'honeypot');
        }

        $startedAt = filter_var($request->input('form_started_at'), FILTER_VALIDATE_INT);
        $age = is_int($startedAt) ? ((int) floor(microtime(true) * 1000) - $startedAt) : -1;
        if ($age < 1500 || $age > 1000 * 60 * 60 * 24 * 7) {
            $this->blocked($request, $action, 'timing');
        }

        if (! config('services.turnstile.enabled')) {
            return;
        }

        $siteKey = (string) config('services.turnstile.site_key');
        $secret = (string) config('services.turnstile.secret_key');
        $token = (string) $request->input('turnstile_token');
        if ($siteKey === '' || $secret === '') {
            Log::critical('Turnstile is enabled but not configured. Public form blocked.', ['action' => $action]);
            $this->unavailable();
        }
        if ($token === '') {
            $this->reject('Please complete the spam check and try again.');
        }

        try {
            $response = Http::asForm()->timeout(5)->post((string) config('services.turnstile.verify_url'), [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Turnstile verification could not be reached.', ['action' => $action, 'error' => $e->getMessage()]);
            $this->unavailable();
        }

        $expectedHostnames = array_filter(array_map('trim', explode(',', (string) config('services.turnstile.expected_hostname'))));
        $valid = $response->successful()
            && $response->json('success') === true
            && $response->json('action') === $action
            && (! $expectedHostnames || in_array($response->json('hostname'), $expectedHostnames, true));

        if (! $valid) {
            Log::notice('Turnstile rejected a public form submission.', [
                'action' => $action,
                'ip' => $request->ip(),
                'error_codes' => $response->json('error-codes', []),
            ]);
            $this->reject('We could not verify your submission. Please try again.');
        }
    }

    private function blocked(Request $request, string $action, string $reason): never
    {
        Log::notice('Blocked suspected automated public form submission.', [
            'action' => $action,
            'ip' => $request->ip(),
            'reason' => $reason,
        ]);

        $this->reject('We could not send your form. Please try again.');
    }

    private function unavailable(): never
    {
        $this->reject('Spam protection is temporarily unavailable. Please try again in a moment.');
    }

    private function reject(string $message): never
    {
        throw ValidationException::withMessages(['email' => $message]);
    }
}
