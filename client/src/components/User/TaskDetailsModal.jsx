import React from 'react';
import { X, Clock, MapPin, IndianRupee, Trash2, RefreshCw, AlertCircle, Briefcase, Calendar } from 'lucide-react';

const TaskDetailsModal = ({ task, isOpen, onClose, onRenew, onDelete }) => {
  if (!isOpen || !task) return null;

  const [renewDate, setRenewDate] = React.useState("");
  // Expiration Logic: 
  // 1. Explicit 'expired' status
  // 2. OR 'broadcasting' BUT past 'expiresAt' (if exists)
  // 3. OR 'broadcasting' BUT past 'scheduledStartAt' (id expiresAt doesn't exist - legacy fallback)
  const isExpired = task.status === "expired" ||
    (task.expiresAt && new Date(task.expiresAt) < new Date()) ||
    (!task.expiresAt && task.status === "broadcasting" && new Date(task.scheduledStartAt) < new Date());

  // Reset date when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setRenewDate(now.toISOString().slice(0, 10)); // YYYY-MM-DD
    }
  }, [isOpen, task]);

  const handleRenewClick = () => {
    if (!renewDate) {
      alert("Please select a date and time for renewal.");
      return;
    }
    onRenew(task._id, renewDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

        {/* Header Image Area */}
        <div className="h-48 bg-gray-100 relative shrink-0">
          {task.images && task.images.length > 0 ? (
            <img
              src={task.images[0]}
              alt={task.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
              <Briefcase size={48} />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-md"
          >
            <X size={20} />
          </button>
          <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm flex items-center gap-1.5 ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
            task.status === 'inProgress' ? 'bg-blue-100 text-blue-700' :
              task.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                isExpired ? 'bg-red-500 text-white' :
                  'bg-black text-white'
            }`}>
            {isExpired && <AlertCircle size={10} />}
            {isExpired ? 'Expired' : task.status}
          </div>
        </div>

        {/* Body Content - Scrollable */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 leading-none mb-2">
            {task.title}
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
            {task.taskType} {task.subcategory && `• ${task.subcategory}`}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-1 text-gray-400">
                <IndianRupee size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Budget</span>
              </div>
              <p className="text-xl font-black text-gray-900">₹{task.price}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-1 text-gray-400">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Posted</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {task.description || "No description provided."}
              </p>
            </div>

            {task.address && (
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">Location</h3>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{task.address}</p>
                </div>
              </div>
            )}

            {task.images && task.images.length > 1 && (
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-3">Gallery</h3>
                <div className="grid grid-cols-3 gap-2">
                  {task.images.slice(1).map((img, idx) => (
                    <img key={idx} src={img} alt="task gallery" className="w-full h-24 rounded-xl object-cover border border-gray-100" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-3 shrink-0">
          {isExpired && (
            <div className="flex-1 flex gap-2">
              <input
                type="date"
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={handleRenewClick}
                className="px-6 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Renew
              </button>
            </div>
          )}

          <button
            onClick={() => { onDelete(task._id); onClose(); }}
            className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${isExpired ? 'px-6 bg-white border-red-200 text-red-500 hover:bg-red-50' : 'flex-1 bg-gray-900 text-white hover:bg-black'
              }`}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
