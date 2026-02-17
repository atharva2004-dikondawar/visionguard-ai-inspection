import { useState } from "react";
import { analyticsApi } from "../lib/api";
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

export default function Dashboard() {
  const [objectId, setObjectId] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setError("");
    try {
      const res = await analyticsApi.getAnalytics(objectId.trim());
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load analytics");
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
    <div style={{ padding: 20 }}>
      <h2>Analytics Dashboard</h2>

      <input
        placeholder="Enter object ID"
        value={objectId}
        onChange={(e) => setObjectId(e.target.value)}
        style={{ width: "300px" }}
      />

      <button onClick={loadAnalytics} style={{ marginLeft: 10 }}>
        Load
      </button>

      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <>
          <h3>Total Inspections: {data.total}</h3>
          <h3>Defect Rate: {data.defect_rate}%</h3>

          <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
            
            {/* PIE CHART */}
            <div style={{ width: 350, height: 300 }}>
              <h4>Normal vs Defect</h4>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={100}
                    label
                  >
                    <Cell fill="#22c55e" /> {/* Normal - Green */}
                    <Cell fill="#ef4444" /> {/* Defect - Red */}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* BAR CHART */}
            <div style={{ width: 350, height: 300 }}>
              <h4>Inspection Counts</h4>
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
