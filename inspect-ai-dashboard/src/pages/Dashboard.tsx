// import { useState } from "react";
// import { analyticsApi } from "../lib/api";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// export default function Dashboard() {
//   const [objectId, setObjectId] = useState("");
//   const [data, setData] = useState<any>(null);
//   const [error, setError] = useState("");

//   const loadAnalytics = async () => {
//     setError("");
//     try {
//       const res = await analyticsApi.getAnalytics(objectId.trim());
//       setData(res);
//     } catch (err: any) {
//       setError(err.response?.data?.detail || "Failed to load analytics");
//     }
//   };

//   const pieData = data
//     ? [
//         { name: "Normal", value: data.normal },
//         { name: "Defect", value: data.defect },
//       ]
//     : [];

//   const barData = data
//     ? [
//         { name: "Normal", count: data.normal },
//         { name: "Defect", count: data.defect },
//       ]
//     : [];

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Analytics Dashboard</h2>

//       <input
//         placeholder="Enter object ID"
//         value={objectId}
//         onChange={(e) => setObjectId(e.target.value)}
//         style={{ width: "300px" }}
//       />

//       <button onClick={loadAnalytics} style={{ marginLeft: 10 }}>
//         Load
//       </button>

//       <br /><br />

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {data && (
//         <>
//           <h3>Total Inspections: {data.total}</h3>
//           <h3>Defect Rate: {data.defect_rate}%</h3>

//           <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
            
//             {/* PIE CHART */}
//             <div style={{ width: 350, height: 300 }}>
//               <h4>Normal vs Defect</h4>
//               <ResponsiveContainer>
//                 <PieChart>
//                   <Pie
//                     data={pieData}
//                     dataKey="value"
//                     outerRadius={100}
//                     label
//                   >
//                     <Cell fill="#22c55e" /> {/* Normal - Green */}
//                     <Cell fill="#ef4444" /> {/* Defect - Red */}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>

//             {/* BAR CHART */}
//             <div style={{ width: 350, height: 300 }}>
//               <h4>Inspection Counts</h4>
//               <ResponsiveContainer>
//                 <BarChart data={barData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="count" fill="#3b82f6" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import { analyticsApi } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Loader2, AlertCircle, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Dashboard() {
  const [objectId, setObjectId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    if (!objectId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await analyticsApi.getAnalytics(objectId.trim());
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const pieData = data
    ? [
        { name: "Normal", value: data.normal },
        { name: "Defect", value: data.defect },
      ]
    : [];

  const barData = data
    ? [
        { name: "Normal", count: data.normal },
        { name: "Defect", count: data.defect },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Analytics Dashboard" description="View inspection trends and defect rates per object" />

      <div className="industrial-card mb-6">
        <div className="industrial-card-header">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Analytics Lookup</span>
        </div>
        <div className="industrial-card-body space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Object ID</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={objectId}
                onChange={(e) => setObjectId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadAnalytics()}
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter object ID"
              />
              <button
                onClick={loadAnalytics}
                disabled={loading || !objectId.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Load
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {!data && !error && (
        <div className="industrial-card">
          <div className="industrial-card-body py-10 text-center text-sm text-muted-foreground">
            Enter an object ID above to view its inspection analytics.
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="industrial-card">
              <div className="industrial-card-body text-center">
                <p className="metric-value text-primary">{data.total}</p>
                <p className="metric-label">Total</p>
              </div>
            </div>
            <div className="industrial-card">
              <div className="industrial-card-body text-center">
                <p className="metric-value text-green-400">{data.normal}</p>
                <p className="metric-label">Normal</p>
              </div>
            </div>
            <div className="industrial-card">
              <div className="industrial-card-body text-center">
                <p className="metric-value text-destructive">{data.defect}</p>
                <p className="metric-label">Defects</p>
              </div>
            </div>
            <div className="industrial-card">
              <div className="industrial-card-body text-center">
                <p className="metric-value text-primary">{data.defect_rate}%</p>
                <p className="metric-label">Defect Rate</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="industrial-card">
              <div className="industrial-card-header">
                <PieChartIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Normal vs Defect</span>
              </div>
              <div className="industrial-card-body" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius={100}
                      label={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "2px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="industrial-card">
              <div className="industrial-card-header">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Inspection Counts</span>
              </div>
              <div className="industrial-card-body" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "2px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}