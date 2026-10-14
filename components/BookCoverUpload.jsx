'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  BookOpen, 
  Loader2 
} from 'lucide-react';

/**
 * Professional Book Cover Image Uploader for LibraHub Admin
 * Supports drag-and-drop, native file picker, preview, format & size validation (max 5MB),
 * remove / replace operations, and responsive scholarly placeholder.
 */
export default function BookCoverUpload({
  currentCoverUrl = '',
  currentFileId = '',
  bookTitle = '',
  bookAuthor = '',
  onCoverChange, // (result: { url: string, fileId: string, file?: File }) => void
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentCoverUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Synchronize when currentCoverUrl changes from outside (e.g., loaded from database)
  React.useEffect(() => {
    if (currentCoverUrl && !selectedFile) {
      setPreviewUrl(currentCoverUrl);
    }
  }, [currentCoverUrl, selectedFile]);

  const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  const validateFile = (file) => {
    if (!file) return 'No file selected.';

    const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const isExtValid = ALLOWED_EXTS.includes(fileExt);
    const isTypeValid = ALLOWED_TYPES.includes(file.type.toLowerCase()) || isExtValid;

    if (!isTypeValid) {
      return `Invalid file format "${file.name}". Supported formats are JPG, JPEG, PNG, and WebP.`;
    }

    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return `File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`;
    }

    return null;
  };

  const handleProcessFile = async (file) => {
    setErrorMessage('');
    setSuccessNotice('');

    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setSelectedFile(file);

    // Create immediate local object URL for preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Perform upload to /api/upload/cover
    try {
      setUploading(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('cover', file);

      // Simulated smooth progress while waiting for network
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 100);

      const res = await fetch('/api/upload/cover', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();

      if (res.ok && data.success) {
        setPreviewUrl(data.url);
        setSuccessNotice('Cover image uploaded and verified!');
        if (onCoverChange) {
          onCoverChange({
            url: data.url,
            fileId: data.fileId,
            file,
          });
        }
      } else {
        setErrorMessage(data.error || 'Failed to upload cover image.');
      }
    } catch (err) {
      setErrorMessage('Network or server error during image upload.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
      setTimeout(() => setSuccessNotice(''), 4000);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setSelectedFile(null);
    setErrorMessage('');
    setSuccessNotice('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onCoverChange) {
      onCoverChange({
        url: '',
        fileId: '',
        file: null,
      });
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-800">
          Book Cover Image <span className="text-slate-400 font-normal">(Optional · JPG, PNG, WebP up to 5 MB)</span>
        </label>
        {previewUrl && (
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Cover Selected
          </span>
        )}
      </div>

      {/* Hidden Native File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Main Upload Box & Preview Area */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* Left: Interactive Preview Showcase */}
        <div className="sm:col-span-5 flex flex-col items-center">
          <div className="relative w-full aspect-[3/4] max-w-[200px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs flex items-center justify-center">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt={bookTitle ? `Cover preview for ${bookTitle}` : 'Book cover preview'}
                  className="w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-white text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400 mb-2" />
                    <span className="text-xs font-semibold">Uploading...</span>
                    <span className="text-[10px] text-slate-300 mt-1">{uploadProgress}%</span>
                  </div>
                )}
              </>
            ) : (
              /* Scholarly Empty State Placeholder */
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white text-center select-none">
                <BookOpen className="h-10 w-10 text-blue-400/80 mb-2" />
                <span className="font-serif text-xs font-bold text-slate-200 line-clamp-2 px-1">
                  {bookTitle || 'Book Title'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {bookAuthor || 'Author Name'}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-blue-300/80 font-mono mt-3 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40">
                  No Cover Selected
                </span>
              </div>
            )}
          </div>

          {/* Action buttons under thumbnail */}
          {previewUrl && !uploading && (
            <div className="mt-2.5 flex items-center gap-2 w-full max-w-[200px]">
              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={disabled}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs"
              >
                <RefreshCw className="h-3 w-3 text-slate-500" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={disabled}
                className="inline-flex items-center justify-center p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors shadow-2xs"
                title="Remove Cover Image"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Drag-and-Drop Area & Meta info */}
        <div className="sm:col-span-7 space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
            } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  <span className="text-blue-600 underline">Click to browse</span> or drag and drop
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  JPG, JPEG, PNG, or WebP up to 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-mono text-[11px] text-slate-800 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          )}

          {/* Progress Bar (when uploading) */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Saving to LibraHub Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Storage Architecture Badge & Guidance */}
          <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>LibraHub Persistent Server Storage</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Cover image is stored in persistent server media storage (<code className="font-mono text-slate-700">/uploads/covers/</code>) and referenced cleanly in MongoDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
