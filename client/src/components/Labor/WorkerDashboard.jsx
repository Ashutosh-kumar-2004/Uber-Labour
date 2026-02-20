import React, { useState, useEffect, useRef } from 'react';
import useSetWorkerAvailability from "../../hooks/worker/useSetWorkerAvailability";
import useWorkerProfile from "../../hooks/worker/useWorkerProfile";
import useAvailableTasks from "../../hooks/worker/useAvailableTasks";
import useAcceptTask from "../../hooks/worker/useAcceptTask";
import useCompleteTask from "../../hooks/worker/useCompleteTask";
import useRejectTask from "../../hooks/worker/useRejectTask";
import ConfirmModal from "../constants/ConfirmModal";
import useOTPActions from "../../hooks/worker/useOTPActions";
import TaskDetailsModal from './TaskDetailsModal';
import WorkerNavigationMap from './WorkerNavigationMap';
import useLocationBroadcast, { bearingToLabel } from "../../hooks/worker/useLocationBroadcast";
import { DISTANCE_OPTIONS } from "../../constants/task.constants";
import {
  Briefcase,
  Power,
  Wallet,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Bell,
  ArrowUpRight,
  Filter,
  X,
  AlertTriangle,
  Navigation,
  Map as MapIcon,
  ShieldCheck,
  Zap,
  IndianRupee,
  Compass
} from 'lucide-react';
import { Timer } from 'lucide-react';

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 opacity-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-red-600">Error</h3>
            <p className="text-gray-500 text-sm font-medium mt-1">{error}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
          >
            Dimiss
          </button>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, task }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="text-green-600" size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-black">Task Accepted!</h3>
            <p className="text-gray-500 text-sm font-bold mt-2">You have successfully accepted the task.</p>
          </div>

          {task && (
            <div className="bg-gray-50 p-4 rounded-2xl w-full border border-gray-200 mt-2">
              <h4 className="font-bold text-sm line-clamp-1">{task.title}</h4>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs font-medium text-gray-500">Earnings:</span>
                <span className="text-lg font-black tracking-tighter">₹{task.price}</span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95 mt-4"
          >
            Go to Details
          </button>
        </div>
      </div>
    </div>
  );
};

const BannedScreen = ({ banExpiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(banExpiresAt);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ban Expired. Please refresh.");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [banExpiresAt]);

  const handleContactSupport = () => {
    // Placeholder for support contact
    window.location.href = "mailto:support@workifypro.com?subject=Ban Appeal";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600 rounded-full blur-[100px] opacity-10 -ml-10 -mb-10"></div>

      <div className="relative z-10 max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <AlertTriangle className="text-red-500" size={48} />
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter text-red-500 mb-2">Access Restricted</h1>
        <p className="text-gray-400 font-medium">
          Your account has been temporarily suspended due to rejecting an assigned task.
        </p>

        <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ban Lifts In</p>
          <div className="text-5xl font-black text-white tracking-tighter font-mono">
            {timeLeft || "--:--:--"}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Repeated rejections may lead to a permanent ban.
          </p>
          <button
            onClick={handleContactSupport}
            className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            Contact Support
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};



const BanWarningModal = ({ isOpen, onClose, onConfirm, rejecting }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-in border-t-4 border-red-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="text-red-600" size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-black">Warning!</h3>
            <p className="text-gray-500 text-sm font-bold mt-2">Rejecting this task has consequences.</p>
          </div>

          <div className="bg-red-50 p-4 rounded-xl w-full border border-red-100 text-left space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              <span>₹50 Fine will be deducted</span>
            </div>
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              <span>6-Hour Ban from platform</span>
            </div>
          </div>

          <div className="w-full">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 block text-left">Reason for Rejection</label>
            <textarea
              className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black resize-none"
              rows="3"
              placeholder="Why act you rejecting this task?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-black py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={rejecting}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95 disabled:opacity-70"
            >
              {rejecting ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... WorkerDashboard component ...
const WorkerDashboard = () => {
  // ... hooks ...
  const { worker, activeTask, loading: profileLoading, refetch: refetchProfile } = useWorkerProfile();
  const { setAvailability, loading: toggleLoading } = useSetWorkerAvailability();
  const { tasks, loading: tasksLoading, error: tasksError, fetchTasks, setError: setTasksError } = useAvailableTasks();
  const { acceptTask, loading: acceptLoading, error: acceptError } = useAcceptTask();
  const { completeTask, loading: completeLoading, error: completeError } = useCompleteTask();
  const { rejectTask, loading: rejectLoading, error: rejectError } = useRejectTask();

  const [isOnline, setIsOnline] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [customDistance, setCustomDistance] = useState("");
  const [isCustomDistance, setIsCustomDistance] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showNavMap, setShowNavMap] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  // OTP state
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const { markArrived, submitOTP, arrivedLoading, otpLoading } = useOTPActions();

  // ── Live elapsed-time counter for inProgress tasks ──
  const [elapsed, setElapsed] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (activeTask?.status === "inProgress" && (activeTask.otpVerifiedAt || activeTask.arrivedAt)) {
      const startTime = new Date(activeTask.otpVerifiedAt || activeTask.arrivedAt).getTime();
      const tick = () => {
        const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setElapsed(
          h > 0
            ? `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
            : `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
        );
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setElapsed("");
    }
    return () => clearInterval(timerRef.current);
  }, [activeTask?.status, activeTask?.otpVerifiedAt, activeTask?.arrivedAt]);

  // ── Real-time GPS tracking (active only when task exists) ──
  const { isTracking, speed, bearing, workerCoords, routePath } =
    useLocationBroadcast(activeTask?._id || null);
  // ... (Fetch tasks effect remains same) ...
  useEffect(() => {
    if (worker) {
      setIsOnline(worker.isOnline); // Sync local state with DB
      if (worker.currentLocation) {
        const [lng, lat] = worker.currentLocation.coordinates;
        fetchTasks({ lat, lng, distance: selectedDistance });
      }
    }
  }, [worker, selectedDistance, fetchTasks]);

  // Derived state for ban
  const isBanned = worker?.banExpiresAt && new Date(worker.banExpiresAt) > new Date();
  const banExpiresAt = worker?.banExpiresAt;

  // If banned, show BannedScreen
  if (isBanned) {
    return <BannedScreen banExpiresAt={banExpiresAt} />;
  }

  // If not verified
  if (worker && worker.status !== 'verified') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl maxWidth-md text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-yellow-600" size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Verification Pending</h2>
          <p className="text-gray-500 font-medium">Your profile is currently under review or rejected.</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-4">Status: {worker.status}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800"
          >
            Refresh Status
          </button>
        </div>
      </div>
    )
  }

  const handleToggleAvailability = async () => {
    // Check ban first
    if (isBanned) {
      alert(`You are banned until ${new Date(banExpiresAt).toLocaleTimeString()}`);
      return;
    }

    try {
      const newStatus = !isOnline;
      if (!newStatus && activeTask) {
        alert("You cannot go offline while you have an active task.");
        return;
      }
      setIsOnline(newStatus);
      await setAvailability(newStatus);
      refetchProfile();
    } catch (error) {
      setIsOnline(!isOnline);
      console.error("Failed to toggle availability:", error);
    }
  };

  const handleDistanceChange = (distance) => {
    setSelectedDistance(distance);
    setIsCustomDistance(false);
    setCustomDistance("");
    if (worker && worker.currentLocation) {
      const [lng, lat] = worker.currentLocation.coordinates;
      fetchTasks({ lat, lng, distance });
    }
  };

  const handleCustomDistanceSubmit = (e) => {
    e.preventDefault();
    if (customDistance && !isNaN(customDistance) && Number(customDistance) > 0) {
      setIsCustomDistance(true);
      setSelectedDistance(Number(customDistance));
      if (worker && worker.currentLocation) {
        const [lng, lat] = worker.currentLocation.coordinates;
        fetchTasks({ lat, lng, distance: Number(customDistance) });
      }
    }
  };

  const calculateDistance = (taskLocation) => {
    if (!worker || !worker.currentLocation || !taskLocation) return null;
    const [lng1, lat1] = worker.currentLocation.coordinates;
    const [lng2, lat2] = taskLocation.coordinates;

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
  };

  const handleAcceptTask = async (taskId) => {
    try {
      await acceptTask(taskId);
      setSelectedTask(null);
      if (worker && worker.currentLocation) {
        const [lng, lat] = worker.currentLocation.coordinates;
        const distance = isCustomDistance && customDistance ? parseFloat(customDistance) : selectedDistance;
        fetchTasks({ lat, lng, distance });
      }
      await refetchProfile();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to accept task", err);
      setTasksError(err.message || "Failed to accept task");
    }
  };

  const handleCompleteTask = async () => {
    if (!activeTask) return;
    setShowCompleteModal(true);
  };

  const confirmCompleteTask = async () => {
    try {
      await completeTask(activeTask._id);
      setShowCompleteModal(false);
      await refetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to complete task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectTaskConfirm = async (reason) => {
    if (!activeTask) return;
    try {
      await rejectTask(activeTask._id, reason);
      setShowBanModal(false);
      await refetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to reject task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleMarkArrived = async () => {
    if (!activeTask) return;
    try {
      await markArrived(activeTask._id);
      // Refetch to get updated task.status = 'arrived'
      await refetchProfile();
      setOtpInput("");
      setOtpError(null);
    } catch (err) {
      alert("Failed to mark arrival: " + err.message);
    }
  };

  const handleSubmitOTP = async () => {
    if (!activeTask || otpInput.trim().length !== 4) {
      setOtpError("Please enter the 4-digit code.");
      return;
    }
    setOtpError(null);
    try {
      await submitOTP(activeTask._id, otpInput.trim());
      setOtpSuccess(true);
      await refetchProfile(); // updates task to inProgress
    } catch (err) {
      if (err.expired) {
        setOtpError("⏱ Code expired. Tap \"I've Arrived\" again to resend.");
      } else {
        setOtpError(err.message || "Incorrect code. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-black relative">
      <ErrorModal error={tasksError || acceptError || completeError || rejectError} onClose={() => setTasksError(null)} />
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} task={activeTask} />
      <BanWarningModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleRejectTaskConfirm}
        rejecting={rejectLoading}
      />

      <TaskDetailsModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onAccept={handleAcceptTask}
        loading={acceptLoading}
        workerLocation={worker?.currentLocation}
      />

      {/* ── COMPLETION CONFIRMATION MODAL ── */}
      {showCompleteModal && activeTask && (
        <ConfirmModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          onConfirm={confirmCompleteTask}
          loading={completeLoading}
          title="Complete This Task?"
          summaryRows={[
            { label: "Task", value: activeTask.title },
            { label: "Payment", value: `₹${activeTask.price}`, highlight: true },
            ...(elapsed ? [{ label: "Duration", value: elapsed }] : []),
          ]}
          checkboxLabel="Have you collected the cash?"
          checkboxLabelChecked="Cash Collected"
          checkboxDescription={<>Confirm that you have received <span className="font-black text-gray-800">₹{activeTask.price}</span> from the client before marking this task as complete.</>}
          confirmText="Confirm"
        />
      )}

      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white p-2 rounded-xl">
            <Briefcase size={20} />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">Workify<span className="text-gray-400">Pro</span></span>
        </div>

        <div className="flex items-center gap-6">
          {/* Availability Toggle / Ban Status */}
          <div className="flex items-center gap-3">
            {isBanned ? (
              <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200 flex items-center gap-1">
                <AlertTriangle size={12} />
                Banned until {new Date(banExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : (
              <>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <button
                  onClick={handleToggleAvailability}
                  disabled={toggleLoading || profileLoading}
                  className={`w-14 h-8 rounded-full flex items-center p-1 transition-all duration-300 ${isOnline ? 'bg-black' : 'bg-gray-200'} ${toggleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`}>
                    <Power size={12} className={isOnline ? 'text-black' : 'text-gray-300'} />
                  </div>
                </button>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-gray-100 shadow-sm">
              {/* Placeholder for avatar */}
              <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400 font-black">
                {worker?.name?.[0] || "U"}
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold uppercase tracking-wide">{worker?.name || "Worker"}</p>
              <p className="text-[10px] text-gray-400 font-medium">Level 1 Pro</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-6 space-y-8">

        {/* ── Worker Navigation Map overlay ──────────────────────── */}
        {showNavMap && activeTask && (
          <WorkerNavigationMap
            task={activeTask}
            workerCoords={workerCoords}
            routePath={routePath}
            speed={speed}
            bearing={bearing}
            isTracking={isTracking}
            onClose={() => setShowNavMap(false)}
          />
        )}

        {/* ACTIVE TASK CARD */}
        {activeTask && (
          <div className="bg-black text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-sm p-2 pr-4 rounded-full border border-zinc-800">
                  <div className="bg-green-500 p-1.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                    <Zap size={14} fill="currentColor" className="text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-400">In Progress</span>
                </div>

                {/* ── Tracking Active badge (hide when inProgress — worker already arrived) ── */}
                {isTracking && activeTask.status !== "inProgress" && (
                  <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                    <Navigation size={12} className="text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                      {speed} km/h · {bearingToLabel(bearing)}
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Address */}
              <div className="mb-6">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{activeTask.title}</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapIcon size={16} />
                  <p className="font-bold text-sm tracking-wide">{activeTask.address}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <IndianRupee size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Earnings</span>
                  </div>
                  <p className="text-2xl font-black tracking-tighter">₹{activeTask.price}</p>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Est. Time</span>
                  </div>
                  <p className="text-2xl font-black tracking-tighter">{activeTask.estimatedDurationMinutes || '--'} min</p>
                </div>
              </div>

              {/* ─── STATUS-AWARE ACTION AREA ─────────────────────────── */}

              {/* ASSIGNED: Show "I've Arrived" button */}
              {activeTask.status === "assigned" && (
                <div className="mt-2">
                  <button
                    onClick={handleMarkArrived}
                    disabled={arrivedLoading}
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white disabled:opacity-60"
                  >
                    {arrivedLoading ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <MapPin size={18} />
                        <span>I've Arrived</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-gray-500 text-xs mt-2">Tap when you reach the job location. An OTP will be sent to the client's email.</p>
                </div>
              )}

              {/* ARRIVED: Show OTP input */}
              {activeTask.status === "arrived" && (
                <div className="mt-2 bg-zinc-900/70 rounded-2xl border border-zinc-700 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-1">OTP sent to client’s email</p>
                  <p className="text-gray-400 text-xs mb-4">Ask the client for the 4-digit code and enter it below to start the task.</p>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setOtpInput(v);
                      setOtpError(null);
                    }}
                    placeholder="• • • •"
                    className="w-full text-center text-3xl font-black tracking-[0.5em] bg-white/5 border border-zinc-600 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 mb-3"
                  />

                  {otpError && (
                    <p className="text-red-400 text-xs text-center mb-3 font-bold">{otpError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkArrived}
                      disabled={arrivedLoading}
                      className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs font-bold uppercase tracking-widest border border-zinc-700 disabled:opacity-50"
                      title="Resend OTP"
                    >
                      {arrivedLoading ? "↻" : "↻ Resend"}
                    </button>
                    <button
                      onClick={handleSubmitOTP}
                      disabled={otpLoading || otpInput.length !== 4}
                      className="flex-1 bg-green-500 hover:bg-green-400 text-white py-3 rounded-xl font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {otpLoading ? "Verifying…" : "✔ Verify & Start"}
                    </button>
                  </div>
                </div>
              )}

              {/* IN PROGRESS: Timer + Complete + Details + Reject (no Navigate — worker already arrived) */}
              {(activeTask.status === "inProgress" || (!activeTask.status)) && (
                <div>
                  {/* Live elapsed timer */}
                  {elapsed && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl mb-3">
                      <Timer size={16} className="text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Working Time</span>
                      <span className="ml-auto text-lg font-black tracking-tight text-amber-300 font-mono">{elapsed}</span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    {/* Complete */}
                    <button
                      onClick={handleCompleteTask}
                      disabled={completeLoading}
                      className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                      {completeLoading ? "Completing..." : (
                        <>
                          <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                          <span>Complete</span>
                        </>
                      )}
                    </button>

                    {/* Details */}
                    <button
                      className="bg-zinc-800 text-white px-5 rounded-2xl hover:bg-zinc-700 transition-all active:scale-[0.98] border border-zinc-700"
                      onClick={() => setSelectedTask(activeTask)}
                    >
                      <ArrowUpRight size={22} />
                    </button>

                    {/* Reject */}
                    <button
                      onClick={() => setShowBanModal(true)}
                      className="bg-red-500/10 text-red-500 px-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] border border-red-500/20 hover:border-red-500"
                      title="Reject Task"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>
              )}

              {/* ASSIGNED / ARRIVED: also show Details  + Reject below the main action */}
              {(activeTask.status === "assigned" || activeTask.status === "arrived") && (
                <div className="flex gap-2 mt-3">
                  <button
                    className="flex-1 bg-zinc-800 text-white py-3 rounded-2xl hover:bg-zinc-700 transition-all border border-zinc-700 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                    onClick={() => setSelectedTask(activeTask)}
                  >
                    <ArrowUpRight size={16} /> Details
                  </button>
                  <button
                    onClick={() => setShowBanModal(true)}
                    className="bg-red-500/10 text-red-500 px-5 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] border border-red-500/20 hover:border-red-500"
                    title="Reject Task"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-xl font-black uppercase tracking-tighter">
                {activeTask ? "Nearby Opportunities (Queued)" : "Nearby Opportunities"}
              </h3>

              {/* Distance Filter - Show if Online OR Active Task */}
              {(isOnline || activeTask) && (
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                  {DISTANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleDistanceChange(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${!isCustomDistance && selectedDistance === opt.value
                        ? 'bg-black text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
                  <form onSubmit={handleCustomDistanceSubmit} className="flex items-center">
                    <input
                      type="number"
                      min={0}
                      placeholder="Custom"
                      value={customDistance}
                      onChange={(e) => setCustomDistance(e.target.value)}
                      className={`w-16 px-2 py-1 text-xs font-bold border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-black ${isCustomDistance ? 'border-black bg-gray-50' : 'border-gray-200'
                        }`}
                    />
                    <button
                      type="submit"
                      className={`px-2 py-1 rounded-r-lg text-[10px] font-bold uppercase tracking-widest border border-l-0 transition-all ${isCustomDistance
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                      km
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* FEED CONTENT LOGIC */}
            {!isOnline && !activeTask ? (
              <div className="bg-gray-100 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">Go Online to see available tasks in your area</p>
              </div>
            ) : tasksLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl animate-pulse h-40"></div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">No tasks found within this range.</p>
                <button
                  onClick={() => setSelectedDistance(100)}
                  className="mt-4 text-xs font-bold underline"
                >
                  Try increasing distance
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const dist = calculateDistance(task.location);
                  return (
                    <div key={task._id} className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-black transition-all group shadow-sm hover:shadow-md">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded">{task.taskType}</span>
                          {task.subcategory && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded">{task.subcategory}</span>
                          )}
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{task.title}</h4>

                        {/* Address */}
                        <div className="flex items-center gap-1.5 mt-1 mb-2">
                          <MapIcon size={12} className="text-gray-400" />
                          <p className="text-xs font-bold text-gray-500 line-clamp-1">{task.address || "Location not specified"}</p>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-gray-400 text-xs font-medium">
                          <div className="flex items-center gap-1">
                            <Navigation size={14} className={dist && dist < 5 ? "text-green-600" : ""} />
                            {dist ? `${dist} km away` : 'Nearby'}
                          </div>
                          <div className="flex items-center gap-1"><Clock size={14} />
                            {task.estimatedDurationMinutes ? `${task.estimatedDurationMinutes} mins` : 'Flexible'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                        <div className="text-right">
                          <p className="text-2xl font-black tracking-tighter">₹{task.price}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">You Keep 85%</p>
                        </div>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="bg-black text-white p-4 rounded-xl hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter">Account</h3>

            <div className="bg-white border border-gray-200 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4 text-gray-400">
                <Star size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Rating</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">{worker?.rating || "N/A"}</h2>
              <p className="text-gray-500 text-xs mt-2 font-medium">{worker?.completedTasks || 0} Completed Tasks</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-widest">Withdraw Funds</span>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-black transition-colors" />
              </div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-widest">My Certifications</span>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-black transition-colors" />
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-widest">Help & Safety</span>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-black transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;