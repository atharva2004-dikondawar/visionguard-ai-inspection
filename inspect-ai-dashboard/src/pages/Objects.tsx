// import { useState } from "react";
// import { objectsApi } from "@/lib/api";
// import { Plus, Box, Copy, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
// import PageHeader from "@/components/PageHeader";

// const Objects = () => {
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [createdObject, setCreatedObject] = useState<any>(null);
//   const [copied, setCopied] = useState(false);

//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim()) return;
//     setLoading(true);
//     setError("");
//     try {
//       const data = await objectsApi.create(name.trim());
//       setCreatedObject(data);
//       setName("");
//     } catch (err: any) {
//       setError(err.response?.data?.detail || "Failed to create object");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyId = (id: string) => {
//     navigator.clipboard.writeText(id);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div>
//       <PageHeader title="Object Management" description="Register inspection objects and retrieve their IDs" />

//       {/* Create Object */}
//       <div className="industrial-card mb-6">
//         <div className="industrial-card-header">
//           <Plus className="w-4 h-4 text-primary" />
//           <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Create New Object</span>
//         </div>
//         <div className="industrial-card-body">
//           <form onSubmit={handleCreate} className="flex gap-3">
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="flex-1 px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
//               placeholder="Object name (e.g., PCB-Board-A1)"
//               required
//             />
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
//             >
//               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
//               Create
//             </button>
//           </form>

//           {error && (
//             <div className="mt-3 flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
//               <AlertCircle className="w-4 h-4 shrink-0" />
//               {error}
//             </div>
//           )}

//           {createdObject && (
//             <div className="mt-4 p-4 rounded-sm bg-muted/50 border border-border">
//               <div className="flex items-center gap-2 mb-2">
//                 <CheckCircle2 className="w-4 h-4 text-green-400" />
//                 <span className="text-sm font-medium">Object Created Successfully</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-mono text-muted-foreground">ID:</span>
//                 <code className="text-sm font-mono text-primary">{createdObject.object_id || createdObject.id}</code>
//                 <button
//                   onClick={() => copyId(createdObject.object_id || createdObject.id)}
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
//                 </button>
//               </div>
//               {createdObject.name && (
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className="text-xs font-mono text-muted-foreground">Name:</span>
//                   <span className="text-sm font-mono">{createdObject.name}</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Info */}
//       <div className="industrial-card">
//         <div className="industrial-card-header">
//           <Box className="w-4 h-4 text-primary" />
//           <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Usage</span>
//         </div>
//         <div className="industrial-card-body">
//           <p className="text-sm text-muted-foreground">
//             Create objects to group inspections. Use the <code className="text-primary font-mono text-xs">object_id</code> in the inspection and history pages.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Objects;import { useState, useEffect } from "react";

import { useState, useEffect } from "react";
import { objectsApi } from "@/lib/api";
import { Plus, Box, Copy, Loader2, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface ObjectRecord {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = "visionguard:objects";

const loadStoredObjects = (): ObjectRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredObjects = (objects: ObjectRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));
  } catch {
    // localStorage unavailable (e.g. private browsing) — fail silently
  }
};

const Objects = () => {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdObject, setCreatedObject] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [objects, setObjects] = useState<ObjectRecord[]>([]);

  // For backfilling objects created before this page existed (or via curl/Postman)
  const [manualName, setManualName] = useState("");
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    setObjects(loadStoredObjects());
  }, []);

  const addToRegistry = (id: string, objName: string) => {
    setObjects((prev) => {
      const withoutDuplicate = prev.filter((o) => o.id !== id);
      const next = [{ id, name: objName, createdAt: new Date().toISOString() }, ...withoutDuplicate];
      saveStoredObjects(next);
      return next;
    });
  };

  const removeFromRegistry = (id: string) => {
    setObjects((prev) => {
      const next = prev.filter((o) => o.id !== id);
      saveStoredObjects(next);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      const data = await objectsApi.create(name.trim());
      setCreatedObject(data);
      const id = data.object_id || data.id;
      addToRegistry(id, data.name || name.trim());
      setName("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create object");
    } finally {
      setCreating(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualId.trim()) return;
    addToRegistry(manualId.trim(), manualName.trim());
    setManualName("");
    setManualId("");
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
              disabled={creating}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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
                  {copiedId === (createdObject.object_id || createdObject.id) ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
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

      {/* Manually register an existing ID */}
      <div className="industrial-card mb-6">
        <div className="industrial-card-header">
          <Box className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Register an Existing Object ID
          </span>
        </div>
        <div className="industrial-card-body">
          <p className="text-xs text-muted-foreground mb-3">
            Already have an object ID from before (e.g. from an old screenshot or terminal log)? Add it here so it shows up below.
          </p>
          <form onSubmit={handleManualAdd} className="flex gap-3">
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Name (e.g., PCB-Board-A1)"
            />
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Object ID (e.g., ab9061c6-9714-42fe-900c-c9a48d41c16e)"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-muted border border-border text-foreground font-semibold text-sm rounded-sm hover:border-primary/50 transition-colors flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>
        </div>
      </div>

      {/* All Objects */}
      <div className="industrial-card overflow-hidden">
        <div className="industrial-card-header">
          <Box className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            All Objects ({objects.length})
          </span>
        </div>

        {objects.length === 0 ? (
          <div className="industrial-card-body py-10 text-center text-sm text-muted-foreground">
            No objects registered yet. Create one above, or add a known ID manually.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Object ID</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {objects.map((obj) => (
                  <tr key={obj.id}>
                    <td>{obj.name || <span className="text-muted-foreground">—</span>}</td>
                    <td>
                      <code className="text-xs font-mono text-primary">{obj.id}</code>
                    </td>
                    <td>
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => copyId(obj.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy ID"
                        >
                          {copiedId === obj.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => removeFromRegistry(obj.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove from this list (does not delete the object on the server)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Objects;