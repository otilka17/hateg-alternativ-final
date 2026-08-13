import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  currentImageUrl?: string | null;
  onUploaded: (storageId: Id<"_storage">) => void;
  onRemove?: () => void;
  className?: string;
};

export default function ImageUploader({ currentImageUrl, onUploaded, onRemove, className = "" }: Props) {
  const generateUploadUrl = useMutation(api.cms.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setRemoved(false);
      onUploaded(storageId as Id<"_storage">);
      toast.success("Imagine încărcată!");
    } catch {
      toast.error("Eroare la încărcare");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setRemoved(true);
    if (fileRef.current) fileRef.current.value = "";
    onRemove?.();
  };

  const displayUrl = preview || (removed ? null : currentImageUrl);

  return (
    <div className={`relative ${className}`}>
      {displayUrl ? (
        <div className="relative group">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-32 object-cover rounded-sm border border-foreground/10"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="cursor-pointer absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Șterge imaginea"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-foreground/15 rounded-sm hover:border-primary/40 transition-colors bg-muted/30">
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload size={20} className="text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Încarcă imagine</span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
