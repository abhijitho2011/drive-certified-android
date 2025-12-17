import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";
import { toast } from "sonner";
import { Upload, Check, X, Loader2, FileText, Image } from "lucide-react";

interface Props {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  userId: string;
}

interface DocumentType {
  id: keyof ApplicationFormData['documents'];
  label: string;
  required: boolean;
  accept: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  { id: "licenceFront", label: "Driving Licence (Front)", required: true, accept: "image/*,.pdf" },
  { id: "licenceBack", label: "Driving Licence (Back)", required: true, accept: "image/*,.pdf" },
  { id: "aadhaarId", label: "Aadhaar / Government ID", required: true, accept: "image/*,.pdf" },
  { id: "policeClearance", label: "Police Clearance Certificate", required: false, accept: "image/*,.pdf" },
  { id: "photograph", label: "Passport Size Photograph", required: true, accept: "image/*" },
];

const DocumentUploadSection = ({ formData, updateFormData, userId }: Props) => {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (docType: keyof ApplicationFormData['documents'], file: File) => {
    if (!file || !userId) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(docType);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${docType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("application-documents")
        .getPublicUrl(fileName);

      updateFormData({
        documents: {
          ...formData.documents,
          [docType]: fileName,
        },
      });

      toast.success("Document uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveDocument = async (docType: keyof ApplicationFormData['documents']) => {
    const fileName = formData.documents[docType];
    if (!fileName) return;

    try {
      await supabase.storage
        .from("application-documents")
        .remove([fileName]);

      const updatedDocs = { ...formData.documents };
      delete updatedDocs[docType];
      updateFormData({ documents: updatedDocs });

      toast.success("Document removed");
    } catch (error: any) {
      console.error("Remove error:", error);
      toast.error("Failed to remove document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Upload clear, readable copies of your documents. Accepted formats: Images (JPG, PNG) or PDF.
          Maximum file size: 5MB per document.
        </p>
      </div>

      <div className="space-y-4">
        {DOCUMENT_TYPES.map((doc) => {
          const isUploaded = !!formData.documents[doc.id];
          const isUploading = uploading === doc.id;

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                isUploaded
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isUploaded ? (
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {doc.accept.includes("image") ? (
                        <Image className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">
                      {doc.label}
                      {doc.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {isUploaded && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Document uploaded successfully
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isUploaded ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  ) : (
                    <div className="relative">
                      <Input
                        type="file"
                        accept={doc.accept}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.id, file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <Button variant="outline" size="sm" disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentUploadSection;
