import { useState } from "react";
import { inspectionApi } from "@/lib/api";
import { Upload, Layers, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface BatchResult {
  filename: string;
  anomaly_score: number;
  result: string;
}

const BatchInspect = () => {
  const [objectId, setObjectId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResults([]);
    }
  };

  const handleInspect = async () => {
    if (!objectId.trim() || files.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const data = await inspectionApi.inspectBatch(objectId.trim(), files);
      setResults(data.results || data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Batch inspection failed");
    } finally {
      setLoading(false);
    }
  };

  const defectCount = results.filter((r) => r.result?.toUpperCase() === "DEFECT").length;

  return (
    <div>
      <PageHeader title="Batch Inspection" description="Inspect multiple images at once" />

      <div className="industrial-card mb-6">
        <div className="industrial-card-header">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Batch Input</span>
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
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Images ({files.length} selected)</label>
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

          <button
            onClick={handleInspect}
            disabled={loading || files.length === 0 || !objectId.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing {files.length} images...
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                Run Batch Inspection
              </>
            )}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="industrial-card">
              <div className="industrial-card-body text-center">
                <p className="metric-value text-primary">{results.length}</p>
                <p className="metric-label">Total</p>
              </div>
            </div>
            <div className="industrial-card">
              <div className="industrial-card-body text-center">
                <p className="metric-value text-green-400">{results.length - defectCount}</p>
                <p className="metric-label">Normal</p>
              </div>
            </div>
            <div className="industrial-card">
              <div className="industrial-card-body text-center">
                <p className="metric-value text-destructive">{defectCount}</p>
                <p className="metric-label">Defects</p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="industrial-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Filename</th>
                    <th>Anomaly Score</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td className="text-muted-foreground">{i + 1}</td>
                      <td>{r.filename}</td>
                      <td>{r.score?.toFixed(4)}</td>
                      <td>
                        <span className={r.result?.toUpperCase() === "DEFECT" ? "status-defect" : "status-normal"}>
                          {r.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BatchInspect;
