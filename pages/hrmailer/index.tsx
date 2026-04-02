import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';

// Define the shape of a file from Supabase Storage
interface SupabaseFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: any;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface SendMailApiResponse {
  message?: string;
  error?: string;
  results?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

type SendSummary = NonNullable<SendMailApiResponse['results']>;

const parseEmailInput = (value: string) =>
  value
    .split(/[,\n;]+/)
    .map(email => email.trim())
    .filter(email => email !== '');

const sanitizeStorageFileName = (fileName: string) => {
  const trimmed = fileName.trim();
  const extensionMatch = trimmed.match(/(\.[^.]+)$/);
  const extension = extensionMatch
    ? extensionMatch[1].replace(/[^A-Za-z0-9.]/g, '').toLowerCase()
    : '';

  const baseName = (extensionMatch ? trimmed.slice(0, -extension.length) : trimmed)
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  return `${baseName || 'resume'}${extension}`;
};

const buildStoredResumeName = (fileName: string) =>
  `${Date.now()}_${sanitizeStorageFileName(fileName)}`;

const getAttachmentFileName = (storedName: string) =>
  storedName.split('/').pop()?.replace(/^\d+_/, '') || 'Resume.pdf';

const parseApiResponse = async (response: Response): Promise<SendMailApiResponse | null> => {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SendMailApiResponse;
  } catch {
    return {
      message: response.ok
        ? 'The request completed, but the server returned an unreadable response.'
        : `Request failed with status ${response.status}.`,
    };
  }
};

const buildSendStatusMessage = (results: NonNullable<SendMailApiResponse['results']>) => {
  const summary = `Sent successfully: ${results.success}. Failed: ${results.failed}.`;
  const errorPreview = results.errors.slice(0, 2);

  if (errorPreview.length === 0) {
    return summary;
  }

  return `${summary} ${errorPreview.join(' | ')}`;
};

const createEmptySendSummary = (): SendSummary => ({
  success: 0,
  failed: 0,
  errors: [],
});

const getRequestErrorMessage = (
  response: Response,
  result: SendMailApiResponse | null
) => {
  if (response.status === 504) {
    return 'Sending timed out on the server. Try fewer emails in one attempt.';
  }

  return [result?.message, result?.error].filter(Boolean).join(': ')
    || `Request failed with status ${response.status}.`;
};

export default function HRMailer() {
  const [emailsRaw, setEmailsRaw] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [resumes, setResumes] = useState<SupabaseFile[]>([]);
  const [selectedResumeName, setSelectedResumeName] = useState('');
  
  // Database templates state
  const [dbTemplates, setDbTemplates] = useState<Template[]>([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplSubject, setNewTplSubject] = useState('');
  const [newTplBody, setNewTplBody] = useState('');
  const [savingTpl, setSavingTpl] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'info'|'success'|'error'>('info');

  const bucketName = 'resumes';
  const isMailerBusy = sending || uploading;

  useEffect(() => {
    fetchResumes();
    fetchTemplates();
  }, []);

  const displayStatus = (msg: string, type: 'info'|'success'|'error', timeout = 4000) => {
    setStatusMsg(msg);
    setStatusType(type);
    if (timeout > 0) {
      setTimeout(() => setStatusMsg(''), timeout);
    }
  };

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list();
      if (error) {
        console.error('Error fetching resumes:', error);
        return;
      }
      if (data) {
        const validDocs = data.filter(f => f.name !== '.emptyFolderPlaceholder');
        setResumes(validDocs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.from('hrmailer_templates').select('*');
      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }
      if (data) {
        setDbTemplates(data as Template[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const tpl = dbTemplates.find(t => t.id === selectedId);
    if (tpl) {
      setSubject(tpl.subject);
      setHtmlBody(tpl.body);
    } else {
      setSubject('');
      setHtmlBody('');
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTplName || !newTplSubject || !newTplBody) {
      alert("Please fill out all template fields.");
      return;
    }
    
    setSavingTpl(true);
    try {
      const { data, error } = await supabase
        .from('hrmailer_templates')
        .insert([
          { name: newTplName, subject: newTplSubject, body: newTplBody }
        ])
        .select();

      if (error) {
        alert(`Error saving template: ${error.message}`);
      } else {
        await fetchTemplates(); 
        setShowModal(false);
        setNewTplName('');
        setNewTplSubject('');
        setNewTplBody('');
        displayStatus('Template saved successfully!', 'success');
      }
    } catch (err: any) {
      alert(`Error saving template: ${err.message}`);
    } finally {
      setSavingTpl(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    displayStatus(`Uploading ${file.name}...`, 'info', 0); // No auto-timeout for upload start
    try {
      const fileName = buildStoredResumeName(file.name);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        displayStatus(`Upload Error: ${error.message}`, 'error');
        if (error.message.includes('bucket not found') || error.message.includes('Bucket not found')) {
            alert('The "resumes" bucket does not exist in Supabase. Please create a public bucket named "resumes" in your Supabase dashboard.');
        }
      } else {
        displayStatus('Upload successful!', 'success');
        await fetchResumes(); 
        setSelectedResumeName(fileName);
      }
    } catch (err: any) {
      displayStatus(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectResume = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    if (!selectedName) {
      setSelectedResumeName('');
      return;
    }

    setSelectedResumeName(selectedName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailsList = Array.from(new Set(parseEmailInput(emailsRaw)));

    if (emailsList.length === 0) {
      displayStatus('Please provide at least one valid email address.', 'error');
      return;
    }

    if (!subject || !htmlBody) {
      displayStatus('Please provide both Subject and Email Body.', 'error');
      return;
    }

    setSending(true);
    displayStatus('Sending emails... (this might take a few moments)', 'info', 0);

    try {
      const summary = createEmptySendSummary();

      for (const [index, email] of emailsList.entries()) {
        displayStatus(`Sending ${index + 1} of ${emailsList.length}: ${email}`, 'info', 0);

        const response = await fetch('/api/hrmailer/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emails: [email],
            subject,
            htmlBody,
            resumePath: selectedResumeName || undefined,
            resumeFileName: selectedResumeName ? getAttachmentFileName(selectedResumeName) : undefined
          })
        });

        const result = await parseApiResponse(response);

        if (response.ok && result?.results) {
          summary.success += result.results.success;
          summary.failed += result.results.failed;
          summary.errors.push(...result.results.errors);
          continue;
        }

        if (response.ok) {
          summary.success += 1;
          continue;
        }

        summary.failed += 1;
        summary.errors.push(`${email}: ${getRequestErrorMessage(response, result)}`);
      }

      displayStatus(
        buildSendStatusMessage(summary),
        summary.failed === 0 ? 'success' : 'error',
        10000
      );

    } catch (err: any) {
      displayStatus(`Sending failed: ${err.message}`, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-base-100 flex flex-col font-poppins">
      <Head>
        <title>HR Mailer | Expense Tracker</title>
      </Head>

      {/* Simple Header */}
      <div className='flex flex-col max-w-5xl mx-auto w-full px-4 pt-8 md:pt-12 pb-6 shrink-0'>
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-2xl">📨</span>
          <h1 className='text-3xl font-poppinsMed text-base-content tracking-wide'>HR Mailer</h1>
        </div>
        <p className='text-base-content/60 text-[13px] md:text-sm max-w-sm leading-relaxed'>
          Send bulk, individualized emails directly from your synced Gmail.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full px-4 relative z-20 pb-32">
        
        {statusMsg && (
          <div className={`alert ${statusType === 'error' ? 'alert-error text-white' : statusType === 'success' ? 'alert-success text-white' : 'alert-info text-white'} shadow-xl rounded-2xl mb-6 text-sm font-poppins border-none flex items-center animate-fade-in`}>
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Left Column - Mail Configuration Card */}
          <div className="md:col-span-3 bg-base-100 dark:bg-base-200/60 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none rounded-[28px] p-6 border border-base-content/5 flex flex-col gap-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-poppinsMed text-[12px] uppercase tracking-wider opacity-60">HR Email Addresses</span>
                <span className="label-text-alt opacity-50 font-mono text-[11px]">Comma, semicolon, or new line</span>
              </label>
              <textarea 
                className="textarea w-full h-24 md:h-28 rounded-2xl bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 resize-none" 
                placeholder={"hr1@company.com, hr2@company.com;\nhr3@company.com"}
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                disabled={isMailerBusy}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-poppinsMed text-[12px] uppercase tracking-wider opacity-60 flex justify-between w-full items-center">
                  <span>Saved Templates</span>
                  <button 
                    type="button" 
                    className="btn btn-xs rounded-lg btn-outline btn-primary normal-case hover:scale-105 active:scale-95 transition-transform"
                    onClick={() => setShowModal(true)}
                    disabled={isMailerBusy}
                  >
                    + Create New
                  </button>
                </span>
              </label>
              <select 
                className="select w-full rounded-2xl bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 outline-none border-base-content/10 transition-all font-poppins text-sm" 
                onChange={handleSelectTemplate} 
                defaultValue=""
                disabled={isMailerBusy}
              >
                <option value="" disabled>-- Load Template --</option>
                {dbTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
              {dbTemplates.length === 0 && (
                <span className="text-[11px] text-primary/80 mt-2 px-1">No templates yet. Click above to track one.</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-poppinsMed text-[12px] uppercase tracking-wider opacity-60">Subject Line</span>
              </label>
              <input 
                type="text" 
                className="input w-full rounded-2xl bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 border-base-content/10 transition-all text-sm font-poppins" 
                placeholder="e.g. Frontend Developer Application"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isMailerBusy}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-poppinsMed text-[12px] uppercase tracking-wider opacity-60">Email Body (HTML)</span>
              </label>
              <textarea 
                className="textarea w-full h-32 md:h-48 rounded-2xl bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 border-base-content/10 transition-all font-mono text-sm leading-relaxed whitespace-pre-wrap" 
                placeholder="<p>Dear Hiring Manager,</p>&#10;&#10;<p>I am writing to express my interest...</p>"
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                disabled={isMailerBusy}
              />
            </div>
          </div>

          {/* Right Column - Attachment Stack */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Attachment Card */}
            <div className="bg-gradient-to-br from-base-100 to-base-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none rounded-[28px] p-6 border border-primary/10 flex flex-col gap-5 shrink-0">
              <h2 className="text-[16px] font-poppinsMed opacity-80 flex items-center gap-2">
                <span>📎</span> Attach Resume
              </h2>

              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text font-poppinsMed text-[11px] uppercase tracking-wider opacity-50">Cloud Resumes</span>
                </label>
                <select 
                  className="select w-full rounded-2xl bg-base-100 border-base-content/10 hover:border-primary/40 focus:ring-2 focus:ring-primary/30 transition-all font-poppins text-sm"
                  value={selectedResumeName}
                  onChange={handleSelectResume}
                  disabled={isMailerBusy}
                >
                  <option value="">-- No Resume --</option>
                  {resumes.map((res) => (
                    <option key={res.name} value={res.name}>
                      {res.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-base-content/10"></div>
                <span className="flex-shrink-0 mx-4 text-base-content/40 text-[10px] font-poppinsMed uppercase">OR UPLOAD</span>
                <div className="flex-grow border-t border-base-content/10"></div>
              </div>

              <div className="form-control">
                <input 
                  type="file" 
                  className="file-input file-input-bordered w-full rounded-2xl bg-base-100 file:bg-base-200 file:border-none file:font-poppinsMed file:text-base-content file:px-4 cursor-pointer hover:border-primary/40 transition-all text-xs" 
                  onChange={handleFileUpload}
                  disabled={isMailerBusy}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>

            {/* Sticky Submit Button Card */}
            <button 
                type="button" 
                onClick={handleSubmit}
                className="btn btn-primary h-14 w-full shadow-lg shadow-primary/25 rounded-[20px] font-poppinsMed normal-case text-base hover:-translate-y-0.5 active:scale-95 transition-all duration-200 border-none"
                disabled={isMailerBusy}
              >
                {sending ? (
                  <>
                    <span className="loading loading-spinner text-white opacity-80"></span>
                    <span className="text-white">Dispatching...</span>
                  </>
                ) : (
                  <span className="text-white">Review & Send to HRs ✨</span>
                )}
            </button>
            
          </div>
        </div>
      </div>

      {/* STYLISH MODAL FOR CREATE TEMPLATE */}
      {showModal && (
         <div className="fixed inset-0 z-[100] flex md:items-center md:justify-center bg-black/60 backdrop-blur-sm md:p-6 transition-opacity animate-in fade-in duration-300">
           
           <div className="bg-base-100 md:rounded-[32px] shadow-2xl w-full h-full md:h-auto max-w-2xl flex flex-col md:max-h-[85vh] overflow-hidden border border-white/10 slide-in-bottom-modal">
             
             {/* Modal Header */}
             <div className="p-5 md:p-6 border-b border-base-content/5 flex justify-between items-center bg-base-100/80 backdrop-blur-md z-10 shrink-0">
               <h3 className="text-lg font-poppinsMed">Create New Template</h3>
               <button className="btn btn-sm btn-circle btn-ghost bg-base-200 hover:bg-error hover:text-white" onClick={() => setShowModal(false)}>✕</button>
             </div>
             
             {/* Modal Body */}
             <div className="p-5 md:p-6 overflow-y-auto flex-1 flex flex-col gap-5 custom-scrollbar">
               <div className="form-control">
                 <label className="label"><span className="label-text font-poppinsMed text-[12px] uppercase tracking-wider opacity-60">Template Name</span></label>
                 <input 
                   type="text" 
                   className="input w-full rounded-2xl bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 border-base-content/10 transition-all font-poppins text-sm" 
                   placeholder="e.g. UI/UX Designer Follow-up"
                   value={newTplName}
                   onChange={e => setNewTplName(e.target.value)}
                 />
               </div>
               
               <div className="form-control">
                 <label className="label"><span className="label-text font-poppinsMed text-[12px] uppercase tracking-wider opacity-60">Subject Line</span></label>
                 <input 
                   type="text" 
                   className="input w-full rounded-2xl bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 border-base-content/10 transition-all font-poppins text-sm" 
                   placeholder="Application for UI/UX Designer"
                   value={newTplSubject}
                   onChange={e => setNewTplSubject(e.target.value)}
                 />
               </div>
               
               <div className="form-control flex-1 flex flex-col">
                 <label className="label"><span className="label-text font-poppinsMed text-[12px] uppercase tracking-wider opacity-60">HTML Body</span></label>
                 <textarea 
                   className="textarea w-full rounded-2xl bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/30 border-base-content/10 transition-all flex-1 min-h-[250px] font-mono text-sm leading-relaxed" 
                   placeholder="<p>Dear Hiring Manager,</p>..."
                   value={newTplBody}
                   onChange={e => setNewTplBody(e.target.value)}
                 />
                 <span className="text-[10px] opacity-40 uppercase pt-2 pl-2">Use Standard HTML Tags</span>
               </div>
             </div>

             {/* Modal Footer */}
             <div className="p-5 md:p-6 border-t border-base-content/5 bg-base-200/30 flex justify-end gap-3 shrink-0">
               <button className="btn btn-ghost rounded-xl font-poppinsMed" onClick={() => setShowModal(false)}>Cancel</button>
               <button className="btn btn-primary rounded-xl px-8 shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all" onClick={handleSaveTemplate} disabled={savingTpl}>
                 {savingTpl ? <span className="loading loading-spinner text-white w-4"></span> : <span className="text-white font-poppinsMed">Save Template</span>}
               </button>
             </div>

           </div>
         </div>
      )}

      <style jsx>{`
        .animate-fade-in {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .slide-in-bottom-modal {
            animation: slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUpModal {
            0% { transform: translateY(20px) scale(0.98); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
