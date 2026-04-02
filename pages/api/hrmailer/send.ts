import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export const config = {
  maxDuration: 60,
};

const RESUME_BUCKET = 'resumes';
const SEND_CONCURRENCY = 3;
const RESUME_FETCH_TIMEOUT_MS = 15_000;
const SMTP_CONNECTION_TIMEOUT_MS = 15_000;
const SMTP_GREETING_TIMEOUT_MS = 15_000;
const SMTP_SOCKET_TIMEOUT_MS = 30_000;

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

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const normalizeStoragePath = (value: unknown): string =>
  normalizeString(value).replace(/^\/+|\/+$/g, '');

const normalizeAttachmentFileName = (value: unknown): string => {
  const fallbackName = 'Resume.pdf';
  const normalized = normalizeString(value)
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\\/]+/g, '-');

  return normalized || fallbackName;
};

const stripTimestampPrefix = (value: string): string =>
  value.split('/').pop()?.replace(/^\d+_/, '') || 'Resume.pdf';

const encodeStorageObjectPath = (bucket: string, objectPath: string): string =>
  [bucket, ...objectPath.split('/').filter(Boolean)]
    .map(segment => encodeURIComponent(segment))
    .join('/');

const buildPublicResumeUrl = (objectPath: string): string => {
  const supabaseBaseUrl = normalizeString(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/$/, '');

  if (!supabaseBaseUrl) {
    throw new Error('Supabase URL missing. Please configure NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
  }

  return `${supabaseBaseUrl}/storage/v1/object/public/${encodeStorageObjectPath(RESUME_BUCKET, objectPath)}`;
};

const normalizeHttpUrl = (value: unknown): string => {
  const raw = normalizeString(value);

  if (!raw) {
    return '';
  }

  const parsed = new URL(raw);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Resume URL must use http or https.');
  }

  return parsed.toString();
};

const cleanErrorText = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/\s*[\r\n]+\s*/g, ' ')
    .trim();

const getReadableMailerError = (error: unknown): string => {
  const err = error as {
    message?: string;
    code?: string;
    responseCode?: number;
    response?: string;
  };

  const rawMessage = cleanErrorText(err?.message || 'Unknown error');
  const rawResponse = cleanErrorText(err?.response || '');

  switch (err?.code) {
    case 'EAUTH':
      return 'Gmail authentication failed. Check GMAIL_USER and GMAIL_APP_PASSWORD.';
    case 'EENVELOPE':
      return 'The recipient address was rejected by the mail server.';
    case 'ECONNECTION':
      return 'Could not connect to Gmail SMTP.';
    case 'ETIMEDOUT':
      return 'The mail server timed out while sending.';
    default:
      break;
  }

  if (rawMessage.includes('Failed to fetch resume from')) {
    return 'The selected resume attachment could not be loaded.';
  }

  if (rawMessage.includes('Resume URL must use http or https')) {
    return 'The resume attachment URL is invalid.';
  }

  if (rawMessage.includes('the string did not match the expected pattern')) {
    return 'A mail field contains an invalid format.';
  }

  const parts = [rawMessage];
  if (typeof err?.responseCode === 'number') {
    parts.push(`SMTP ${err.responseCode}`);
  }
  if (rawResponse && rawResponse !== rawMessage) {
    parts.push(rawResponse);
  }

  return parts.join('. ');
};

const sendWithConcurrency = async ({
  concurrency,
  emails,
  send,
}: {
  concurrency: number;
  emails: string[];
  send: (email: string) => Promise<void>;
}) => {
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(concurrency, emails.length));

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const currentIndex = nextIndex;
        nextIndex += 1;

        const email = emails[currentIndex];
        if (!email) {
          return;
        }

        await send(email);
      }
    })
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { subject, htmlBody, emails, resumePath, resumeUrl, resumeFileName, senderName } = req.body;
  const normalizedEmails = normalizeEmails(emails)
    .map(email => email.trim())
    .filter(Boolean);
  const normalizedResumePath =
    normalizeStoragePath(resumePath) ||
    (normalizeString(resumeUrl) ? normalizeStoragePath(resumeFileName) : '');
  const attachmentFileName = normalizedResumePath
    ? normalizeAttachmentFileName(resumeFileName || stripTimestampPrefix(normalizedResumePath))
    : normalizeAttachmentFileName(resumeFileName);

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
      pool: true,
      maxConnections: SEND_CONCURRENCY,
      maxMessages: Infinity,
      connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
      greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
      socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 2. Fetch the resume if a URL is provided
    const attachments: { filename: string; content: Buffer }[] = [];
    const resolvedResumeUrl = normalizedResumePath
      ? buildPublicResumeUrl(normalizedResumePath)
      : normalizeHttpUrl(resumeUrl);

    if (resolvedResumeUrl) {
      const response = await fetch(resolvedResumeUrl, {
        signal: AbortSignal.timeout(RESUME_FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch resume from ${resolvedResumeUrl}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      attachments.push({
        filename: attachmentFileName,
        content: buffer,
      });
    }

    // 3. Loop over the emails and send individually
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const safeSenderName = normalizeString(senderName).replace(/["<>]/g, '');
    const fromAddress = safeSenderName ? `"${safeSenderName}" <${process.env.GMAIL_USER}>` : process.env.GMAIL_USER;
    const baseMailOptions = {
      from: fromAddress,
      subject,
      html: htmlBody,
      attachments,
    };

    await sendWithConcurrency({
      concurrency: SEND_CONCURRENCY,
      emails: normalizedEmails,
      send: async (email) => {
        try {
          await transporter.sendMail({
            ...baseMailOptions,
            to: email,
          });
          results.success++;
        } catch (err: any) {
          console.error(`Failed to send to ${email}:`, err);
          results.failed++;
          results.errors.push(`${email}: ${getReadableMailerError(err)}`);
        }
      },
    });

    transporter.close();

    return res.status(200).json({ 
      message: 'Emails processed', 
      results 
    });

  } catch (error: any) {
    console.error('Email sending error:', error);
    return res.status(500).json({ message: getReadableMailerError(error) });
  }
}
