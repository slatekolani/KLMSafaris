<?php

namespace App\Mail;

use App\Models\Subscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent before a newsletter address becomes an active subscriber. */
class SubscriberConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Subscriber $subscriber)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Confirm your KLM Safaris newsletter subscription');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.subscriber-confirmation');
    }
}
