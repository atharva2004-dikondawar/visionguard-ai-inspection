import { useState } from "react";
import { inspectionApi } from "@/lib/api";
import { History as HistoryIcon, Search, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface HistoryRecord {
  filename: string;
  score: number;
  result: string;
  timestamp: string;
}

const HistoryPage = () => {
  const [objectId, setObjectId] = useState("");
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await inspectionApi.getHistory(objectId.trim());
      setRecords(data.history || data);
      setSearched(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Inspection History" description="View past inspection results for an object" />

      <div className="industrial-card mb-6">
        <div className="industrial-card-header">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Query</span>
        </div>
        <div className="industrial-card-body">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Enter object ID"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>

          {error && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {searched && records.length === 0 && !error && (
        <div className="industrial-card">
          <div className="industrial-card-body text-center py-12 text-muted-foreground text-sm">
            No inspection records found for this object.
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="industrial-card overflow-hidden">
          <div className="industrial-card-header">
            <HistoryIcon className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {records.length} Records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Filename</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td className="text-muted-foreground">{i + 1}</td>
                    <td>{r.filename}</td>
                    <td>{r.score?.toFixed(4)}</td>
                    <td>
                      <span className={r.result?.toUpperCase() === "DEFECT" ? "status-defect" : "status-normal"}>
                        {r.result}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
