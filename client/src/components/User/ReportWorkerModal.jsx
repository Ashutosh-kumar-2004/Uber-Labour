import React, { useState } from "react";
import { X, Flag, CheckCircle } from "lucide-react";
import useSubmitReport from "../../hooks/user/useSubmitReport.jsx";

const REPORT_REASONS = [
  "Unprofessional behavior",
  "Did not complete work",
  "Safety concern",
  "Overcharged",
  "No show",
  "Other",
];

const ReportWorkerModal = ({ taskId, isOpen, onClose, onSuccess }) => {
  const [reason, setReason]           = useState("");
  const [description, setDescription] = useState("");
  const { submitReport, loading, error, success } = useSubmitReport();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) return;
    try {
      await submitReport(taskId, { reason, description });
      if (onSuccess) onSuccess();
    } catch (_) {
      /* error stored in hook */
    }
  };

  /* ── Success screen ─────────────────────────────── */
  if (success) {
    return (
      <div style={overlay}>
        <div style={{ ...card, textAlign: "center", padding: 40 }}>
          <CheckCircle size={64} color="#22C55E" style={{ margin: "0 auto 16px" }} />
          <h2 style={heading}>Report Submitted</h2>
          <p style={{ color: "#6B7280", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
            We've received your report and will review it shortly. Thank you for keeping the community safe.
          </p>
          <button onClick={onClose} style={{ ...btnPrimary, marginTop: 28, width: "100%" }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={card}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "#FEF2F2", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flag size={18} color="#EF4444" />
            </div>
            <h2 style={heading}>Report Worker</h2>
          </div>
          <button onClick={onClose} style={closeBtn} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Reason selector */}
        <label style={labelStyle}>
          Select a reason <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {REPORT_REASONS.map((r) => {
            const active = reason === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 50,
                  border: active ? "2px solid #EF4444" : "2px solid #E5E7EB",
                  background: active ? "#FEF2F2" : "#F9FAFB",
                  color: active ? "#DC2626" : "#374151",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Description */}
        <label style={labelStyle}>
          Additional details <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          placeholder="Describe what happened…"
          rows={4}
          style={textarea}
        />
        <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right", marginTop: 4 }}>
          {description.length}/1000
        </p>

        {/* Error */}
        {error && (
          <p style={{ color: "#EF4444", fontSize: 12, fontWeight: 600, marginTop: 8 }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!reason || loading}
            style={{
              ...btnReport,
              flex: 2,
              opacity: !reason || loading ? 0.5 : 1,
            }}
          >
            {loading ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── styles ─────────────────────────────────────── */
const overlay = {
  position: "fixed", inset: 0, zIndex: 200001,
  background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const card = {
  background: "#fff", borderRadius: 24,
  maxWidth: 460, width: "100%",
  boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
  padding: 32,
};
const heading = { fontSize: 20, fontWeight: 900, letterSpacing: -0.5, margin: 0, textTransform: "uppercase" };
const closeBtn = {
  background: "#F3F4F6", border: "none", borderRadius: "50%",
  width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#374151", marginBottom: 8 };
const textarea = {
  width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 12,
  padding: "12px 14px", fontSize: 13, resize: "vertical",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};
const btnReport = {
  flex: 1, padding: "13px 0", background: "#EF4444", color: "#fff",
  border: "none", borderRadius: 12, fontWeight: 800,
  fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
  boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
};
const btnPrimary = {
  padding: "13px 0", background: "#111827", color: "#fff",
  border: "none", borderRadius: 12, fontWeight: 800,
  fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
};
const btnSecondary = {
  flex: 1, padding: "13px 0", background: "#F3F4F6", color: "#374151",
  border: "none", borderRadius: 12, fontWeight: 800,
  fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
};

export default ReportWorkerModal;
