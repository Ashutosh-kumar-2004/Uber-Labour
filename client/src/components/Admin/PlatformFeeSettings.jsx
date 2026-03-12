import { useSelector } from "react-redux";
import { useState } from "react";
import useAdminPlatformFee from "../../hooks/admin/useAdminPlatformFee";
import { inputCls, labelCls, btnCls, alertCls } from "./adminUtils";

const PlatformFeeSettings = () => {
  const { loading, saving, error, saveFee } = useAdminPlatformFee();
  const feePercent = useSelector((s) => s.admin.feePercent);
  const [inputVal, setInputVal] = useState("");
  const [alert, setAlert] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    const val = parseFloat(inputVal);
    if (isNaN(val) || val < 0 || val > 100) {
      setAlert({ msg: "Please enter a value between 0 and 100", type: "error" });
      return;
    }
    try {
      await saveFee(val);
      setInputVal("");
      setAlert({ msg: `Platform fee updated to ${val}%`, type: "success" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ msg: err.message, type: "error" });
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading fee settings…</div>;
  if (error)   return <div className="text-center py-16 text-red-500 text-sm">{error}</div>;

  const workerPct = feePercent != null ? 100 - feePercent : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finance / Platform Fee</h1>
      {alert && <div className={alertCls(alert.type)}>{alert.msg}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg">
        <h2 className="text-base font-bold text-gray-800 mb-5">Platform Fee Configuration</h2>

        {feePercent != null && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Platform Takes</p>
              <p className="text-4xl font-black text-blue-600">{feePercent}%</p>
            </div>
            <div className="bg-green-50 rounded-xl p-5 text-center">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Worker Gets</p>
              <p className="text-4xl font-black text-green-600">{workerPct}%</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className={labelCls}>New Fee Percentage (%)</label>
            <input
              type="number" min={0} max={100} step={0.5}
              className={inputCls}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={feePercent != null ? `Current: ${feePercent}%` : "e.g. 10"}
              required
            />
          </div>
          <button type="submit" className={btnCls("primary")} disabled={saving}>
            {saving ? "Saving…" : "Update Fee"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlatformFeeSettings;
