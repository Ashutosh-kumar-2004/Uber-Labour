import React, { useState, useEffect } from "react";

import {
  MapPin,
  Plus,
  User,
  Briefcase,
  Star,
  Users,
  CheckCircle,
  ChevronRight,
  Bell,
  Mail,
  Zap,
  AlertTriangle,
  X as XIcon,
} from "lucide-react";
import CreateTask from "./CreateTask.jsx";
import LocationPermissionModal from "./LocationPermissionModal.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setUserLocation } from "../../redux/slices/userSlice.jsx";
import { getGeolocation } from "../../constants/task.constants.jsx";
import useMyTasks from "../../hooks/user/useMyTasks.jsx";
import useTaskNotifications from "../../hooks/user/useTaskNotifications.jsx";
import { Trash2, RefreshCw, Clock, AlertCircle, IndianRupee, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import CustomErrorModal from "../constants/CustomErrorModal.jsx";
import TaskDetailsModal from "./TaskDetailsModal.jsx";

const Dashboard = () => {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const dispatch = useDispatch();
  const location = useSelector((state) => state.user.location);

  /* Lift task state here so we can refetch after task creation */
  const { tasks, loading, error, deleteTask, renewTask, refetch, banInfo, clearBan } = useMyTasks();

  /* Socket-based notifications (worker arrived / task started) */
  const { notifications, popup, dismissPopup, unreadCount, markAllRead } = useTaskNotifications();
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  /* Auto-refetch task list when we get arrival / start events */
  useEffect(() => {
    if (popup) refetch();
  }, [popup]); // eslint-disable-line react-hooks/exhaustive-deps

  /* LOCATE ME HANDLER */
  const handleLocateMe = async () => {
    setLoadingLocation(true);
    try {
      const loc = await getGeolocation();
      dispatch(setUserLocation(loc));
      return loc;
    } catch (error) {
      console.error("Failed to get location:", error);
      alert("Failed to get location. Please enable geolocation permissions.");
      return null;
    } finally {
      setLoadingLocation(false);
    }
  };

  /* HANDLE ENABLE LOCATION FROM MODAL */
  const onEnableLocation = async () => {
    const loc = await handleLocateMe();
    if (loc) {
      setIsLocationModalOpen(false);
      setIsCreateTaskOpen(true);
    }
  };

  /* NEW WORK CLICK HANDLER */
  const handleNewWorkClick = () => {
    if (location) {
      setIsCreateTaskOpen(true);
    } else {
      setIsLocationModalOpen(true);
    }
  };

  /* Close CreateTask and immediately re-fetch task list */
  const handleCreateTaskClose = () => {
    setIsCreateTaskOpen(false);
    refetch(); // pull fresh list so the new task appears
  };

  const categories = [
    {
      id: 1,
      name: "Maintenance & Repair",
      rating: 4.8,
      completed: "1.2k+",
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800&sat=-100",
    },
    {
      id: 2,
      name: "Construction & Renovation",
      rating: 4.9,
      completed: "850+",
      image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800&sat=-100",
    },
    {
      id: 3,
      name: "Household & Lifestyle",
      rating: 4.7,
      completed: "2.5k+",
      image:
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800&sat=-100",
    },
    {
      id: 5,
      name: "Design & Installation",
      rating: 4.9,
      completed: "400+",
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800&sat=-100",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-black">
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-white">
        <div className="flex items-center gap-2">
          <div className="bg-black p-1.5 rounded-lg shadow-sm">
            <Briefcase size={22} className="text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter uppercase leading-none block">
              Workify
            </span>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase leading-none">
              Pro Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLocateMe}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-md transition-all uppercase tracking-wider cursor-pointer"
          >
            <MapPin size={14} />
            Locate Me
          </button>
          <button
            onClick={handleNewWorkClick}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-md transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} />
            New Work
          </button>

          {/* ── Notification Bell ── */}
          <button
            onClick={() => { setShowNotifPanel((p) => !p); markAllRead(); }}
            className="relative w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce"
                style={{ minWidth: 18, height: 18 }}>
                {unreadCount}
              </span>
            )}
          </button>

          <div className="w-9 h-9 border-2 border-black rounded-full flex items-center justify-center ml-1 overflow-hidden cursor-pointer">
            <User size={18} />
          </div>
        </div>
      </nav>

      {/* ── NOTIFICATION PANEL (slides down from bell) ── */}
      {showNotifPanel && (
        <div className="absolute right-6 top-[72px] z-[200] w-96 max-h-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-xs font-black uppercase tracking-widest text-gray-900">Notifications</span>
            <button onClick={() => setShowNotifPanel(false)}>
              <XIcon size={16} className="text-gray-400 hover:text-black" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[360px] divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-5 py-4 flex gap-3 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.type === 'arrived' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {n.type === 'arrived' ? <MapPin size={16} /> : <Zap size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 leading-tight">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    {n.otp && (
                      <div className="mt-2 bg-black rounded-lg px-3 py-2 text-center">
                        <span className="text-white font-black text-lg tracking-[0.4em] font-mono">{n.otp}</span>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 font-bold mt-1">
                      {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── ARRIVAL POPUP TOAST ── */}
      {popup && (
        <div className="fixed top-6 right-6 z-[9000] animate-slide-in-right">
          <div className={`w-96 rounded-2xl shadow-2xl border overflow-hidden ${popup.type === 'arrived' ? 'bg-gradient-to-r from-green-50 to-white border-green-200'
              : popup.type === 'completed' ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200'
                : 'bg-gradient-to-r from-blue-50 to-white border-blue-200'
            }`}>
            {/* Close button */}
            <button onClick={dismissPopup}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 z-10">
              <XIcon size={16} />
            </button>

            <div className="p-5 flex gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${popup.type === 'arrived' ? 'bg-green-500 text-white'
                  : popup.type === 'completed' ? 'bg-amber-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                {popup.type === 'arrived' ? <MapPin size={22} /> : popup.type === 'completed' ? <CheckCircle size={22} /> : <Zap size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{popup.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{popup.message}</p>

                {popup.type === 'arrived' && popup.otp && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your OTP Code</p>
                    <div className="bg-black rounded-xl px-4 py-3 text-center shadow-inner">
                      <span className="text-white font-black text-3xl tracking-[0.6em] font-mono">{popup.otp}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">Share this code with the worker · Also sent to your email</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar auto-dismiss indicator */}
            <div className={`h-1 ${popup.type === 'arrived' ? 'bg-green-400'
                : popup.type === 'completed' ? 'bg-amber-400'
                  : 'bg-blue-400'
              } animate-shrink-bar`} />
          </div>

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(120%); opacity: 0; }
              to   { transform: translateX(0); opacity: 1; }
            }
            .animate-slide-in-right {
              animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes shrinkBar {
              from { width: 100%; }
              to   { width: 0%; }
            }
            .animate-shrink-bar {
              animation: shrinkBar 8s linear forwards;
            }
          `}</style>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <header className="text-center md:text-left">
            <h1 className="text-5xl font-black mb-3 uppercase tracking-tighter">
              Our Services
            </h1>
            <p className="text-gray-500 text-xl font-medium italic">
              Quality help, when you need it.
            </p>
          </header>

          {/* Customer Reach / Stats */}
          <div className="flex justify-center md:justify-end gap-8 border-l-0 md:border-l border-gray-200 md:pl-8">
            <div className="text-center">
              <div className="flex items-center gap-1 text-black font-black text-2xl tracking-tighter">
                <Users size={20} /> 15k+
              </div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                Active Workers
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-black font-black text-2xl tracking-tighter">
                <CheckCircle size={20} /> 50k+
              </div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                Tasks Done
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item) => (
            <div
              key={item.id}
              className="group relative h-96 w-full overflow-hidden rounded-2xl bg-gray-200 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              {/* Category Image */}
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              {/* Rating Badge (Top Right) */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-sm transition-transform group-hover:scale-110">
                <Star size={12} className="fill-black text-black" />
                <span className="text-[11px] font-black">{item.rating}</span>
              </div>

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-[1px] w-6 bg-gray-400"></div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                    {item.completed} Jobs
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white uppercase leading-tight tracking-tighter mb-4">
                  {item.name}
                </h3>

                <button className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 rounded-lg">
                  Explore Workers
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MY POSTED TASKS SECTION */}
        <div className="mt-16">
          <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">
            My Posted Tasks
          </h2>
          <MyTasksSection
            tasks={tasks}
            loading={loading}
            error={error}
            deleteTask={deleteTask}
            renewTask={renewTask}
            refetch={refetch}
            banInfo={banInfo}
            clearBan={clearBan}
          />
        </div>
      </main>

      {/* Footer (Simplified) */}
      <footer className="border-t border-gray-100 py-10 px-6 mt-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400">
          <span className="text-lg font-black text-black uppercase tracking-tighter">
            Workify
          </span>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-black transition-colors">
              Safety
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Join as Worker
            </a>
          </div>
          <p className="text-[10px] font-bold uppercase">© 2026 WORKIFY</p>
        </div>
      </footer>

      {/* LOCATION PERMISSION MODAL */}
      {isLocationModalOpen && !location && (
        <LocationPermissionModal
          onEnableLocation={onEnableLocation}
          isLoading={loadingLocation}
        />
      )}

      {/* CREATE TASK MODAL OVERLAY */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full h-full">
            <CreateTask onClose={handleCreateTaskClose} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Ban countdown screen shown after user cancels an active task ─────────────
const UserBanScreen = ({ banInfo, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(banInfo.banExpiresAt) - new Date();
      if (diff <= 0) { setTimeLeft("00:00"); setExpired(true); return; }
      const m = String(Math.floor(diff / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [banInfo.banExpiresAt]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-15 -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600 rounded-full blur-[120px] opacity-10 -ml-10 -mb-10" />

      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.25)]">
          <AlertTriangle className="text-red-500" size={48} />
        </div>

        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-red-500 mb-3">Account Suspended</h1>
          <p className="text-gray-400 font-medium text-sm leading-relaxed">
            You cancelled a task that had already been accepted by a worker.
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fine Applied</span>
            <span className="text-red-400 font-black">−₹100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Wallet Balance</span>
            <span className="font-black text-white">₹{banInfo.walletBalance}</span>
          </div>
          <div className="h-px bg-zinc-700 my-2" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ban Lifts In</p>
          <div className="text-5xl font-black text-white tracking-tighter font-mono">
            {timeLeft || "--:--"}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-500">Repeated cancellations may lead to a permanent ban.</p>
          {expired ? (
            <button
              onClick={onDismiss}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Dismiss — Ban Lifted
            </button>
          ) : (
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Please wait for the ban to expire.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const MyTasksSection = ({ tasks, loading, error, deleteTask, renewTask, refetch, banInfo, clearBan }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  // Handle global errors
  React.useEffect(() => {
    if (error) {
      setErrorModal({ isOpen: true, message: error });
    }
  }, [error]);

  // Show ban screen immediately when banInfo arrives
  if (banInfo) {
    return <UserBanScreen banInfo={banInfo} onDismiss={clearBan} />;
  }

  const handleDismissError = () => {
    setErrorModal({ isOpen: false, message: "" });
  };

  const handleRenew = async (taskId) => {
    try {
      await renewTask(taskId);
    } catch (e) {
      setErrorModal({ isOpen: true, message: e.message || "Failed to renew task" });
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (e) {
      setErrorModal({ isOpen: true, message: e.message || "Failed to delete task" });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  if (!tasks || tasks.length === 0) return (
    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
      <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-bold text-gray-900">No Works Posted Yet</h3>
      <p className="text-gray-500">Create your first task to get started.</p>
    </div>
  );

  return (
    <>
      <CustomErrorModal
        isOpen={errorModal.isOpen}
        onClose={handleDismissError}
        title="Task Error"
        message={errorModal.message}
      />

      <TaskDetailsModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onRenew={handleRenew}
        onDelete={handleDelete}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tasks.map((task) => {
          // A task is expired when the server marks it so, or its expiry window has passed.
          // Do NOT compare scheduledStartAt — that's the appointment time, not the expiry.
          const isExpired =
            task.status === "expired" ||
            (task.expiresAt && new Date(task.expiresAt) < new Date());

          return (
            <div
              key={task._id}
              className={`
                    relative bg-white rounded-3xl overflow-hidden transition-all duration-500 group
                    ${isExpired ? 'border-2 border-red-100 shadow-red-100/50' : 'border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1'}
                `}
            >
              {/* STATUS BADGE */}
              <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm flex items-center gap-1.5 ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                task.status === 'inProgress' ? 'bg-blue-100 text-blue-700' :
                  task.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                    isExpired ? 'bg-red-500 text-white animate-pulse' :
                      'bg-black text-white'
                }`}>
                {isExpired && <AlertCircle size={10} />}
                {isExpired ? 'Expired' : task.status}
              </div>

              {/* IMAGE HEADER (if exists) */}
              <div className="h-32 w-full bg-gray-100 relative overflow-hidden cursor-pointer" onClick={() => setSelectedTask(task)}>
                {task.images && task.images.length > 0 ? (
                  <img
                    src={task.images[0]}
                    alt={task.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                    <Briefcase size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>

              {/* CARD BODY */}
              <div className="p-6 relative -mt-6">
                <div className="bg-white rounded-t-2xl pt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {task.taskType} {task.subcategory && `• ${task.subcategory}`}
                  </p>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 leading-none mb-4 cursor-pointer hover:underline decoration-2 underline-offset-4" onClick={() => setSelectedTask(task)}>
                    {task.title}
                  </h3>

                  {/* KEY DETAILS */}
                  <div className="space-y-3 mb-6">
                    {/* PRICE */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900">
                        <IndianRupee size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Budget</p>
                        <p className="text-sm font-bold text-gray-900">₹{task.price}</p>
                      </div>
                    </div>

                    {/* DATE */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Posted Date</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(task.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-2">
                    {isExpired && (
                      <button
                        onClick={() => handleRenew(task._id)}
                        className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={14} className="animate-spin-slow" /> Renew Task
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-xl transform active:scale-95"
                      >
                        More Info <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Dashboard;
