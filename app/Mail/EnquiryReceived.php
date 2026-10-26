<?php

namespace App\Mail;

use App\Models\Enquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Alert to the KLM team: a contact message, tour enquiry or trip plan with every detail. Reply goes to the guest. */
class EnquiryReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Enquiry $enquiry)
    {
    }

    public function envelope(): Envelope
    {
        $e = $this->enquiry;
        $subject = match ($e->source) {
            'planner' => "New trip plan — {$e->name}",
            'tour' => 'New enquiry: '.($e->tour?->title ?? 'a tour')." — {$e->name}",
            default => "New message from {$e->name}",
        };

        return new Envelope(subject: $subject, replyTo: [new Address($e->email, $e->name)]);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.enquiry-received');
    }
}
