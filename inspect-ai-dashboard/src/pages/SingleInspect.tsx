import { useState, useCallback } from "react";
import { inspectionApi } from "@/lib/api";
import { Upload, ScanLine, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const SingleInspect = () => {
  const [objectId, setObjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<string | null>(null);
  const [score, setScore] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setHeatmap(null);
      setScore(null);
      setResult(null);
    }
  };

  const handleInspect = async () => {
    if (!objectId.trim() || !file) return;
    setLoading(true);
    setError("");
    try {
      const data = await inspectionApi.inspectSingle(objectId.trim(), file);
      setHeatmap(URL.createObjectURL(data.blob));
      setScore(data.score);
      setResult(data.result);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Inspection failed");
    } finally {
      setLoading(false);
    }
  };

  const isDefect = result?.toUpperCase() === "DEFECT";

  return (
    <div>
      <PageHeader title="Single Inspection" description="Inspect a single image for surface anomalies" />

      {/* Controls */}
      <div className="industrial-card mb-6">
        <div className="industrial-card-header">
          <ScanLine className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Inspection Input</span>
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
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Image</label>
            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : "Click to upload image"}</span>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleInspect}
            disabled={loading || !file || !objectId.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ScanLine className="w-4 h-4" />
                Run Inspection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {(preview || heatmap) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {preview && (
            <div className="industrial-card">
              <div className="industrial-card-header">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Original</span>
              </div>
              <div className="industrial-card-body">
                <img src={preview} alt="Original" className="w-full rounded-sm" />
              </div>
            </div>
          )}
          {heatmap && (
            <div className="industrial-card">
              <div className="industrial-card-header">
                <ScanLine className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Anomaly Heatmap</span>
              </div>
              <div className="industrial-card-body">
                <img src={heatmap} alt="Heatmap" className="w-full rounded-sm" />
              </div>
            </div>
          )}
        </div>
      )}

      {score !== null && result !== null && (
        <div className="grid grid-cols-2 gap-4">
          <div className="industrial-card">
            <div className="industrial-card-body text-center">
              <p className="metric-value text-primary">{score ? Number(score).toFixed(4) : "—"}</p>
              <p className="metric-label">Anomaly Score</p>
            </div>
          </div>
          <div className="industrial-card">
            <div className="industrial-card-body text-center">
              <span className={isDefect ? "status-defect text-base" : "status-normal text-base"}>
                {result}
              </span>
              <p className="metric-label mt-2">Result</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleInspect;
