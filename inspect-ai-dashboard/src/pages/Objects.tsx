import { useState } from "react";
import { objectsApi } from "@/lib/api";
import { Plus, Box, Copy, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const Objects = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdObject, setCreatedObject] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await objectsApi.create(name.trim());
      setCreatedObject(data);
      setName("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create object");
    } finally {
      setLoading(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Object Management" description="Register inspection objects and retrieve their IDs" />

      {/* Create Object */}
      <div className="industrial-card mb-6">
        <div className="industrial-card-header">
          <Plus className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Create New Object</span>
        </div>
        <div className="industrial-card-body">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Object name (e.g., PCB-Board-A1)"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </form>

          {error && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {createdObject && (
            <div className="mt-4 p-4 rounded-sm bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Object Created Successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">ID:</span>
                <code className="text-sm font-mono text-primary">{createdObject.object_id || createdObject.id}</code>
                <button
                  onClick={() => copyId(createdObject.object_id || createdObject.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {createdObject.name && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-muted-foreground">Name:</span>
                  <span className="text-sm font-mono">{createdObject.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="industrial-card">
        <div className="industrial-card-header">
          <Box className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Usage</span>
        </div>
        <div className="industrial-card-body">
          <p className="text-sm text-muted-foreground">
            Create objects to group inspections. Use the <code className="text-primary font-mono text-xs">object_id</code> in the inspection and history pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Objects;
