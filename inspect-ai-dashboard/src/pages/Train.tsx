import { useState } from "react";
import { trainApi } from "../lib/api";

export default function Train() {
  const [objectId, setObjectId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
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
    <div style={{ padding: 20 }}>
      <h2>Train Object (Upload GOOD Images)</h2>

      <input
        placeholder="Enter object ID"
        value={objectId}
        onChange={(e) => setObjectId(e.target.value)}
        style={{ width: "300px", marginBottom: "10px" }}
      />

      <br />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
      />

      <br /><br />

      <button onClick={handleTrain} disabled={loading}>
        {loading ? "Training..." : "Start Training"}
      </button>

      <br /><br />

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
