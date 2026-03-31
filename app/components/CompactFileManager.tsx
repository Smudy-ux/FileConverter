'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { GrAdd, GrFormClose, GrImage, GrDocumentZip, GrPlay, GrDocumentText } from "react-icons/gr";
import { FiChevronDown, FiAlertCircle } from "react-icons/fi";

interface SelectedFile {
  file: File;
  id: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  progress: number;
  resultUrl?: string;
  errorMessage?: string;
  convertedTo?: string;
}

interface ConversionOption {
  id: string;
  label: string;
  from: string;
  to: string;
  toLabel: string;
  type: 'image' | 'video' | 'document';
  acceptTypes: string[];
}

const CONVERSION_OPTIONS: ConversionOption[] = [
  { id: 'png-jpg', label: 'PNG to JPG', from: 'png', to: 'jpeg', toLabel: 'JPG', type: 'image', acceptTypes: ['image/png'] },
  { id: 'jpg-png', label: 'JPG to PNG', from: 'jpeg', to: 'png', toLabel: 'PNG', type: 'image', acceptTypes: ['image/jpeg', 'image/jpg'] },
  { id: 'webp-png', label: 'WebP to PNG', from: 'webp', to: 'png', toLabel: 'PNG', type: 'image', acceptTypes: ['image/webp'] },
  { id: 'png-webp', label: 'PNG to WebP', from: 'png', to: 'webp', toLabel: 'WebP', type: 'image', acceptTypes: ['image/png'] },
  { id: 'jpg-webp', label: 'JPG to WebP', from: 'jpeg', to: 'webp', toLabel: 'WebP', type: 'image', acceptTypes: ['image/jpeg', 'image/jpg'] },
  { id: 'webp-jpg', label: 'WebP to JPG', from: 'webp', to: 'jpeg', toLabel: 'JPG', type: 'image', acceptTypes: ['image/webp'] },
  { id: 'images-pdf', label: 'Images to PDF', from: 'image', to: 'pdf', toLabel: 'PDF', type: 'document', acceptTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const getFileExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext || '';
};

const getFileTypeFromExtension = (ext: string): string => {
  const map: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
  };
  return map[ext] || 'application/octet-stream';
};

const CompactFileManager: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [selectedConversion, setSelectedConversion] = useState<ConversionOption | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for navbar conversion selection
  useEffect(() => {
    const handleNavbarConversion = () => {
      const saved = sessionStorage.getItem('navbarConversion');
      if (saved) {
        const conversion = JSON.parse(saved);
        const fullOption = CONVERSION_OPTIONS.find(opt => opt.id === conversion.id);
        if (fullOption) {
          setSelectedConversion(fullOption);
        }
        sessionStorage.removeItem('navbarConversion');
      }
    };

    window.addEventListener('navbarConversion', handleNavbarConversion);
    return () => window.removeEventListener('navbarConversion', handleNavbarConversion);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: SelectedFile[] = Array.from(files).map(file => {
      // Normalize the file type
      let normalizedType = file.type;
      if (!file.type || file.type === 'application/octet-stream') {
        normalizedType = getFileTypeFromExtension(getFileExtension(file.name));
      }

      return {
        file,
        id: generateId(),
        status: 'pending',
        progress: 0,
      };
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  }, []);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.resultUrl) URL.revokeObjectURL(file.resultUrl);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    selectedFiles.forEach(f => {
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    setSelectedFiles([]);
    setSelectedConversion(null);
  }, [selectedFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.length) {
      const newFiles: SelectedFile[] = Array.from(files).map(file => ({
        file,
        id: generateId(),
        status: 'pending',
        progress: 0,
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  // Image conversion using Canvas API
  const convertImage = async (file: File, toFormat: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        let mimeType = 'image/png';
        if (toFormat === 'jpeg' || toFormat === 'jpg') mimeType = 'image/jpeg';
        else if (toFormat === 'webp') mimeType = 'image/webp';

        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion failed'));
        }, mimeType, 0.92);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  // Convert images to PDF
  const convertImagesToPDF = async (files: File[]): Promise<Blob> => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const pageWidth = pdf.internal.pageSize.getWidth() - 20;
          const pageHeight = pdf.internal.pageSize.getHeight() - 20;
          const imgRatio = img.width / img.height;
          let imgWidth = pageWidth;
          let imgHeight = imgWidth / imgRatio;

          if (imgHeight > pageHeight) {
            imgHeight = pageHeight;
            imgWidth = imgHeight * imgRatio;
          }

          if (i > 0) pdf.addPage();
          pdf.addImage(url, file.type.includes('jpeg') ? 'JPEG' : 'PNG', 10, 10, imgWidth, imgHeight);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        img.src = url;
      });
    }

    return pdf.output('blob');
  };

  const canConvertFile = (file: File, conversion: ConversionOption): boolean => {
    if (conversion.id === 'images-pdf') {
      return file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(getFileExtension(file.name));
    }
    return conversion.acceptTypes.some(t => file.type === t || file.type.includes(t.replace('image/', '')));
  };

  const convertFiles = async () => {
    if (selectedFiles.length === 0 || !selectedConversion) return;

    setIsConverting(true);

    // Mark all as converting first
    setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'converting' })));

    if (selectedConversion.id === 'images-pdf') {
      // Handle images to PDF - all compatible images combined
      const compatibleFiles = selectedFiles.filter(sf => canConvertFile(sf.file, selectedConversion));

      if (compatibleFiles.length === 0) {
        setSelectedFiles(prev => prev.map(f => ({
          ...f,
          status: 'error',
          errorMessage: 'No compatible image files found'
        })));
        setIsConverting(false);
        return;
      }

      try {
        const imageFiles = compatibleFiles.map(sf => sf.file);
        const pdfBlob = await convertImagesToPDF(imageFiles);
        const url = URL.createObjectURL(pdfBlob);

        setSelectedFiles(prev => prev.map(f => {
          if (compatibleFiles.some(cf => cf.id === f.id)) {
            return { ...f, status: 'done', progress: 100, resultUrl: url, convertedTo: 'PDF' };
          }
          return { ...f, status: 'error', errorMessage: 'Not compatible with PDF conversion' };
        }));
      } catch (error) {
        console.error('PDF conversion failed:', error);
        setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'error', errorMessage: 'PDF creation failed' })));
      }
    } else {
      // Handle individual conversions - process all files in parallel
      const conversionPromises = selectedFiles.map(async (fileObj) => {
        const isCompatible = canConvertFile(fileObj.file, selectedConversion);

        if (!isCompatible) {
          return {
            id: fileObj.id,
            success: false,
            error: `Cannot convert ${getFileExtension(fileObj.file.name).toUpperCase() || 'this file'} to ${selectedConversion.toLabel}`
          };
        }

        try {
          const blob = await convertImage(fileObj.file, selectedConversion.to);
          const url = URL.createObjectURL(blob);
          return {
            id: fileObj.id,
            success: true,
            url,
            convertedTo: selectedConversion.toLabel
          };
        } catch (error) {
          return {
            id: fileObj.id,
            success: false,
            error: 'Conversion failed'
          };
        }
      });

      const results = await Promise.all(conversionPromises);

      setSelectedFiles(prev => prev.map(f => {
        const result = results.find(r => r.id === f.id);
        if (result) {
          if (result.success) {
            return { ...f, status: 'done', progress: 100, resultUrl: result.url, convertedTo: result.convertedTo };
          } else {
            return { ...f, status: 'error', errorMessage: result.error };
          }
        }
        return f;
      }));
    }

    setIsConverting(false);
  };

  const downloadFile = (fileObj: SelectedFile) => {
    if (!fileObj.resultUrl) return;

    const originalName = fileObj.file.name;
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const ext = fileObj.convertedTo?.toLowerCase() || 'converted';
    const newName = selectedConversion?.id === 'images-pdf' && selectedFiles.length > 1
      ? 'converted-combined.pdf'
      : selectedConversion?.id === 'images-pdf'
      ? `${baseName}.pdf`
      : `${baseName}.${ext}`;

    const a = document.createElement('a');
    a.href = fileObj.resultUrl;
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    const doneFiles = selectedFiles.filter(f => f.status === 'done');
    doneFiles.forEach((fileObj, index) => {
      if (fileObj.resultUrl) {
        setTimeout(() => downloadFile(fileObj), index * 200);
      }
    });
  };

  const getFileIcon = (type: string, filename: string) => {
    const ext = getFileExtension(filename);
    if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) return <GrImage className="text-xl" />;
    if (type.startsWith('video/') || ['mp4', 'mov', 'avi'].includes(ext)) return <GrPlay className="text-xl" />;
    if (type.includes('zip') || type.includes('compressed') || ext === 'zip') return <GrDocumentZip className="text-xl" />;
    return <GrDocumentText className="text-xl" />;
  };

  const getStatusColor = (status: SelectedFile['status']) => {
    switch (status) {
      case 'converting': return 'text-yellow-400';
      case 'done': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.file.size, 0);
  const hasErrors = selectedFiles.some(f => f.status === 'error');
  const hasConverting = selectedFiles.some(f => f.status === 'converting');
  const allDone = selectedFiles.length > 0 && selectedFiles.every(f => f.status === 'done');

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {selectedFiles.length === 0 ? (
        /* Empty State */
        <div
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer transition-all group bg-[#111]
            ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5 hover:border-blue-500/50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="p-4 rounded-full bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform">
            <GrAdd className="text-3xl text-blue-500" />
          </div>
          <p className="text-lg font-medium text-gray-200">Click or drag files here</p>
          <p className="text-sm text-gray-500 mt-1">Supports images, videos, documents</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* Files Selected State */
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-200">
                {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''} Selected
              </h2>
              <p className="text-sm text-gray-500">{(totalSize / 1024 / 1024).toFixed(2)} MB total</p>
            </div>
            <div className="flex gap-2">
              <label
                htmlFor="file-upload-more"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full cursor-pointer transition-colors group"
              >
                <GrAdd className="text-sm group-hover:rotate-90 transition-transform" />
                <span className="text-sm font-medium">Add More</span>
              </label>
              <input
                id="file-upload-more"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Conversion Type Dropdown */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Convert to:
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-left hover:bg-white/10 transition-colors"
              >
                <span className={selectedConversion ? 'text-white' : 'text-gray-500'}>
                  {selectedConversion ? selectedConversion.label : 'Select conversion type...'}
                </span>
                <FiChevronDown className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {CONVERSION_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedConversion(option);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between
                        ${selectedConversion?.id === option.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'}`}
                    >
                      <span>{option.label}</span>
                      {selectedConversion?.id === option.id && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedConversion && (
              <p className="text-xs text-gray-500 mt-2">
                Accepts: {selectedConversion.acceptTypes.map(t => t.replace('image/', '').toUpperCase()).join(', ')}
              </p>
            )}
          </div>

          {/* File List */}
          <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
            {selectedFiles.map((fileObj) => {
              const isCompatible = selectedConversion ? canConvertFile(fileObj.file, selectedConversion) : true;

              return (
                <div
                  key={fileObj.id}
                  className={`flex items-center gap-4 p-4 bg-white/[0.03] border rounded-2xl group transition-all
                    ${fileObj.status === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className={`p-3 bg-blue-500/10 rounded-xl ${getStatusColor(fileObj.status)}`}>
                    {getFileIcon(fileObj.file.type, fileObj.file.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{fileObj.file.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-gray-400">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {fileObj.status === 'converting' && (
                        <span className="text-xs text-yellow-400">converting...</span>
                      )}
                      {fileObj.status === 'done' && (
                        <span className="text-xs text-green-400">✓ {fileObj.convertedTo || 'done'}</span>
                      )}
                      {fileObj.status === 'error' && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" />
                          {fileObj.errorMessage || 'error'}
                        </span>
                      )}
                      {selectedConversion && !isCompatible && fileObj.status === 'pending' && (
                        <span className="text-xs text-orange-400 flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" />
                          Incompatible format
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {fileObj.status === 'done' && fileObj.resultUrl && (
                      <button
                        onClick={() => downloadFile(fileObj)}
                        className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                        title="Download"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                      title="Remove"
                    >
                      <GrFormClose className="text-xl" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={convertFiles}
              disabled={isConverting || !selectedConversion || hasConverting}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              {!selectedConversion
                ? 'Select Conversion Type'
                : isConverting || hasConverting
                  ? 'Converting...'
                  : allDone
                    ? 'Convert More'
                    : `Convert All to ${selectedConversion.toLabel}`
              }
            </button>

            {allDone && (
              <button
                onClick={downloadAll}
                className="px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-600/20 transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All
              </button>
            )}
          </div>

          {hasErrors && (
            <p className="text-sm text-red-400 text-center bg-red-500/10 py-2 rounded-lg">
              Some files couldn't be converted. Check errors above.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactFileManager;
