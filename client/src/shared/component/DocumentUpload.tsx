import { useEffect, useState, type JSX, type ReactNode } from "react";
import { STORAGE_KEYS } from "../../services/storage";

interface DocumentUploadProps {
  id?: string;
  name: string;
  label?: string;
  className?: string;
  children?: ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: File | null;
}

function DocumentUpload({
  id,
  name,
  label = "Upload PDF",
  className = "",
  children,
  onChange,
  value,
}: DocumentUploadProps): JSX.Element {
  const [preview, setPreview] = useState<string | null>(null);
  const savedPreview = localStorage.getItem(`${name}_preview`);

  useEffect(() => {
    if (value instanceof File) {
      // For PDFs, we can't preview content, but we can show file info
      setPreview(value.name);
      return () => {
        // No URL to revoke for file name preview
      };
    } else if (typeof value === "string" && value) {
      const valueDb: string = STORAGE_KEYS.ASSET_URL + "/" + value;
      setPreview(valueDb);
    } else if (savedPreview) {
      setPreview(savedPreview);
    } else {
      setPreview(null);
    }
  }, [name, value, savedPreview]);

  const handleClick = () => {
    document.getElementById(id || name)?.click();
  };

  return (
    <div className="flex flex-col items-start">
      {label && (
        <label
          htmlFor={id || name}
          className="text-slate-400 text-xs font-medium m-2"
        >
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        className={`rounded-lg border border-dashed border-slate-300 cursor-pointer flex items-center justify-center overflow-hidden bg-slate-100 hover:bg-slate-200 transition ${className}`}
      >
        {preview ? (
          <div className="flex items-center space-x-2 p-4">
            <span className="text-red-500 text-2xl">📄</span>
            <span className="text-slate-700 font-medium">
              {typeof preview === 'string' && preview.startsWith('http') ? 'PDF Document' : preview}
            </span>
          </div>
        ) : (
          children ?? (
            <span className="text-slate-500 text-sm text-center px-2">
              Click to upload PDF
            </span>
          )
        )}
      </div>

      <input
        id={id || name}
        name={name}
        type="file"
        accept=".pdf"
        hidden
        onChange={onChange}
      />
    </div>
  );
}

export { DocumentUpload };
export type { DocumentUploadProps };
