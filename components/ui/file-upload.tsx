"use client"

import * as React from "react"
import { Upload, File, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  accept?: string
  maxSize?: number // in bytes
  onFileSelect: (file: File) => Promise<void>
  uploadedFile?: {
    name: string
    size: number
    uploadedAt: Date
  }
  uploadStatus?: "idle" | "uploading" | "uploaded" | "failed"
  error?: string
  className?: string
}

export function FileUpload({
  accept = ".csv,.xlsx,.xls",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  uploadedFile,
  uploadStatus = "idle",
  error,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleFile = async (file: File) => {
    if (file.size > maxSize) {
      // Error will be handled by parent component via error prop
      return
    }

    setIsProcessing(true)
    try {
      await onFileSelect(file)
    } catch (err) {
      console.error("File upload error:", err)
      // Error handling is done by parent component
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const maxSizeMB = maxSize / (1024 * 1024)

  if (uploadStatus === "uploaded" && uploadedFile) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                <File className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(uploadedFile.size)} • Uploaded {formatDate(uploadedFile.uploadedAt)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className="flex-shrink-0"
            >
              Replace
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          uploadStatus === "uploading" && "pointer-events-none opacity-50",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={uploadStatus === "uploading" || isProcessing}
        />
        <div className="flex flex-col items-center gap-3">
          {uploadStatus === "uploading" || isProcessing ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {uploadStatus === "uploading" || isProcessing
                ? "Uploading..."
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept} (Max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {uploadStatus === "failed" && !error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>Upload failed. Please try again.</p>
        </div>
      )}
    </div>
  )
}

