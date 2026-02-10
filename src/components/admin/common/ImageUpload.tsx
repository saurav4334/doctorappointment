import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label = "Image", folder = "general", className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("admin-uploads")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("admin-uploads")
      .getPublicUrl(fileName);

    onChange(urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");

    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1.5">
        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="h-24 w-24 rounded-lg object-cover border border-border"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:opacity-80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </>
            )}
          </button>
        )}
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
            Change
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
