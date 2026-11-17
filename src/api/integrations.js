import { base44 } from './base44Client';




export const Core = base44.integrations.Core;

export const InvokeLLM = base44.integrations.Core.InvokeLLM;

export const SendEmail = base44.integrations.Core.SendEmail;

export const SendSMS = base44.integrations.Core.SendSMS;

export const UploadFile = base44.integrations.Core.UploadFile;
export const UploadPrivateFile = base44.integrations.Core.UploadPrivateFile;
export const CreateFileSignedUrl = base44.integrations.Core.CreateFileSignedUrl;

/**
 * Open a stored file reference in a new tab, securely.
 * - Legacy records (pre-private-storage) hold public http(s) URLs: open directly.
 * - New records hold a private file_uri: mint a short-lived signed URL (10 min).
 */
export async function openFileInNewTab(fileRef) {
  if (!fileRef) return;
  if (/^https?:\/\//i.test(fileRef)) {
    window.open(fileRef, '_blank');
    return;
  }
  const { signed_url } = await CreateFileSignedUrl({ file_uri: fileRef, expires_in: 600 });
  window.open(signed_url, '_blank');
}

export const GenerateImage = base44.integrations.Core.GenerateImage;

export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;






