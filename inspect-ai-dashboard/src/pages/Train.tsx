// import { useState } from "react";
// import { trainApi } from "../lib/api";

// export default function Train() {
//   const [objectId, setObjectId] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState("");
//   const [error, setError] = useState("");

//   const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setFiles(Array.from(e.target.files));
//     }
//   };

//   const handleTrain = async () => {
//     if (!objectId.trim() || files.length === 0) return;

//     setLoading(true);
//     setError("");
//     setMsg("");

//     try {
//       const res = await trainApi.trainObject(objectId.trim(), files);
//       setMsg(`Training complete. Images used: ${res.images_used}`);
//     } catch (err: any) {
//       setError(err.response?.data?.detail || "Training failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Train Object (Upload GOOD Images)</h2>

//       <input
//         placeholder="Enter object ID"
//         value={objectId}
//         onChange={(e) => setObjectId(e.target.value)}
//         style={{ width: "300px", marginBottom: "10px" }}
//       />

//       <br />

//       <input
//         type="file"
//         multiple
//         accept="image/*"
//         onChange={handleFiles}
//       />

//       <br /><br />

//       <button onClick={handleTrain} disabled={loading}>
//         {loading ? "Training..." : "Start Training"}
//       </button>

//       <br /><br />

//       {msg && <p style={{ color: "green" }}>{msg}</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// }
import { useState } from "react";
import { trainApi } from "@/lib/api";
import { Upload, GraduationCap, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Train() {
  const [objectId, setObjectId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setMsg("");
      setError("");
    }
  };

  const handleTrain = async () => {
    if (!objectId.trim() || files.length === 0) return;
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await trainApi.trainObject(objectId.trim(), files);
      setMsg(`Training complete. Images used: ${res.images_used}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Training failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Train Object" description="Upload good images to train a new object profile" />

      <div className="industrial-card mb-6">
        <div className="industrial-card-header">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Training Input</span>
        </div>
        <div className="industrial-card-body space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Object ID</label>
            <input
              type="text"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Enter object ID"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Good Images ({files.length} selected)
            </label>
            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
              <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {files.length > 0 ? `${files.length} files selected` : "Click to select images"}
              </span>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {msg && (
            <div className="flex items-center gap-2 p-3 rounded-sm bg-primary/10 border border-primary/20 text-primary text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {msg}
            </div>
          )}

          <button
            onClick={handleTrain}
            disabled={loading || files.length === 0 || !objectId.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Training on {files.length} images...
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                Start Training
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}