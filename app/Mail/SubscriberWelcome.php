<?php

namespace App\Mail;

use App\Models\Setting;
use App\Models\Subscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

/** Welcome to a new newsletter subscriber, with a one-click unsubscribe link. */
class SubscriberWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Subscriber $subscriber)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: Setting::allValues()['email_newsletter_subject']);
    }

    public function headers(): Headers
    {
        // Lets mail apps show their own "Unsubscribe" button.
        return new Headers(text: ['List-Unsubscribe' => '<'.$this->subscriber->unsubscribeUrl().'>']);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.subscriber-welcome');
    }
}
