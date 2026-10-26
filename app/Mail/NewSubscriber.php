<?php

namespace App\Mail;

use App\Models\Subscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Alert to the KLM team when someone joins the newsletter. */
class NewSubscriber extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Subscriber $subscriber)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "New newsletter subscriber — {$this->subscriber->email}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new-subscriber');
    }
}
