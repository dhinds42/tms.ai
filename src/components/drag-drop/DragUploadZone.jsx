import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

/**
 * P0-B: Drag & drop file upload zone for driver documents
 */
export default function DragUploadZone({ 
  entityType, 
  entityId, 
  onUploadComplete,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSizeMB = 10
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0]; // Single file for now

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max size: ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExt)) {
      setError(`Invalid file type. Accepted: ${acceptedTypes.join(', ')}`);
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Step 2: Call server function to create document with RBAC + audit
      const result = await base44.functions.applyDragDropAction({
        entity_type: 'Document',
        entity_id: 'new',
        to_state: 'uploaded',
        metadata: {
          document_type: 'delivery_receipt', // Default - can be changed by user
          file_url,
          file_name: file.name,
          entity_type: entityType,
          target_entity_id: entityId
        }
      });

      setUploading(false);
      
      if (result.status === 'success') {
        onUploadComplete(result.entity);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setUploading(false);
      setError(err.message || 'Upload failed');
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Simulate drop event
    const fakeEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      dataTransfer: { files }
    };
    
    await handleDrop(fakeEvent);
  };

  return (
    <Card
      className={`border-2 border-dashed transition-all ${
        isDragging 
          ? 'border-primary-default bg-primary-bg' 
          : 'border-border-default bg-bg-card hover:border-primary-border'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-8 text-center">
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-default border-t-transparent" />
            <p className="text-sm text-text-secondary">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-text-muted" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Drag & Drop Files Here
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              or click to browse
            </p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
            />
            
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload').click()}
              disabled={uploading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Select File
            </Button>

            <p className="text-xs text-text-muted mt-4">
              Accepted: {acceptedTypes.join(', ')} (Max {maxSizeMB}MB)
            </p>

            {error && (
              <div className="mt-4 p-3 bg-error-bg border border-error-border rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-error" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}