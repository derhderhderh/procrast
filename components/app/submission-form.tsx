"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Upload, FileText, ImageIcon, X, Loader2, Send } from "lucide-react"

interface SubmissionFormProps {
  taskId: string
  onSubmit: (data: { type: "text" | "image"; content: string; file?: File }) => Promise<void>
  isSubmitting: boolean
}

export function SubmissionForm({ taskId, onSubmit, isSubmitting }: SubmissionFormProps) {
  const [mode, setMode] = useState<"text" | "image">("text")
  const [textContent, setTextContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async () => {
    if (mode === "text" && textContent.trim()) {
      await onSubmit({ type: "text", content: textContent.trim() })
    } else if (mode === "image" && selectedFile) {
      await onSubmit({ type: "image", content: "", file: selectedFile })
    }
  }

  const canSubmit = mode === "text" ? textContent.trim().length > 0 : selectedFile !== null

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("text")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
            mode === "text"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <FileText className="h-4 w-4" />
          Text
        </button>
        <button
          onClick={() => setMode("image")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
            mode === "image"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <ImageIcon className="h-4 w-4" />
          Image
        </button>
      </div>

      {/* Content Area */}
      {mode === "text" ? (
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Paste or type your work here..."
          className="min-h-[200px] w-full resize-none rounded-xl border border-input bg-secondary/30 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {selectedFile ? (
            <div className="relative rounded-xl border border-border bg-secondary/30 p-3">
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreview(null)
                }}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 w-full rounded-lg object-contain"
                />
              ) : (
                <div className="flex items-center gap-2 p-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedFile.name}</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-secondary/30"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Upload your work</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors",
          canSubmit && !isSubmitting
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit for Analysis
          </>
        )}
      </button>
    </div>
  )
}
