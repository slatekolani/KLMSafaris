<?php

namespace App\Mail;

use App\Models\Enquiry;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** "We've received it" to the guest, with a copy of what they sent. Wording comes from CMS → Emails & notifications. */
class EnquiryConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Enquiry $enquiry)
    {
    }

    public function envelope(): Envelope
    {
        $s = Setting::allValues();
        $inbox = trim(explode(',', (string) ($s['enquiry_email'] ?? ''))[0]) ?: config('mail.from.address');

        return new Envelope(
            subject: $this->enquiry->source === 'planner' ? $s['email_plan_subject'] : $s['email_confirm_subject'],
            replyTo: [new Address($inbox, $s['site_name'] ?? 'KLM Safaris')],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.enquiry-confirmation');
    }
}
