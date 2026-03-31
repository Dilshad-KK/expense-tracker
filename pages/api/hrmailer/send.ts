import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const normalizeEmails = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return value
      .split(/[,\n;]+/)
      .map(email => email.trim())
      .filter(email => email !== '');
  }

  if (Array.isArray(value)) {
    return value
      .flatMap(entry => (typeof entry === 'string' ? entry.split(/[,\n;]+/) : []))
      .map(email => email.trim())
      .filter(email => email !== '');
  }

  return [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { subject, htmlBody, emails, resumeUrl, resumeFileName, senderName } = req.body;
  const normalizedEmails = normalizeEmails(emails);

  if (normalizedEmails.length === 0) {
    return res.status(400).json({ message: 'At least one email address is required' });
  }

  if (!subject || !htmlBody) {
    return res.status(400).json({ message: 'Subject and body are required' });
  }

  // Check for credentials
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ 
      message: 'SMTP credentials missing. Please configure GMAIL_USER and GMAIL_APP_PASSWORD in your .env.local file.' 
    });
  }

  try {
    // 1. Initialize Nodemailer transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 2. Fetch the resume if a URL is provided
    let attachments = [];
    if (resumeUrl) {
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch resume from ${resumeUrl}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      attachments.push({
        filename: resumeFileName || 'Resume.pdf',
        content: buffer,
      });
    }

    // 3. Loop over the emails and send individually
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const fromAddress = senderName ? `"${senderName}" <${process.env.GMAIL_USER}>` : process.env.GMAIL_USER;

    for (const email of normalizedEmails) {
      if (!email.trim()) continue;
      
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: email.trim(),
          subject: subject,
          html: htmlBody,
          attachments: attachments,
        });
        results.success++;
      } catch (err: any) {
        console.error(`Failed to send to ${email}:`, err);
        results.failed++;
        results.errors.push(`Failed for ${email}: ${err.message}`);
      }
    }

    return res.status(200).json({ 
      message: 'Emails processed', 
      results 
    });

  } catch (error: any) {
    console.error('Email sending error:', error);
    return res.status(500).json({ message: 'Error processing request', error: error.message });
  }
}
