import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image, Video } from 'lucide-react'
import { cn } from '../../utils/cn'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  type?: 'image' | 'video' | 'any'
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept,
  multiple = true,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  type = 'any',
  className
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxFiles,
    maxSize
  })

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8 text-gray-400" />
      case 'video':
        return <Video className="w-8 h-8 text-gray-400" />
      default:
        return <Upload className="w-8 h-8 text-gray-400" />
    }
  }

  const getAcceptText = () => {
    switch (type) {
      case 'image':
        return 'PNG, JPG, GIF up to 10MB'
      case 'video':
        return 'MP4, MOV, AVI up to 50MB'
      default:
        return 'Any file type'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          {getIcon()}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {getAcceptText()}
            </p>
          </div>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="bg-error-50 border border-error-200 rounded-lg p-3">
              <p className="text-sm font-medium text-error-800">{file.name}</p>
              {errors.map((error) => (
                <p key={error.code} className="text-xs text-error-600">
                  {error.message}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Accepted Files */}
      {acceptedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Selected Files:</h4>
          {acceptedFiles.map((file) => (
            <div key={file.name} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4 text-gray-500" />
                ) : file.type.startsWith('video/') ? (
                  <Video className="w-4 h-4 text-gray-500" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload