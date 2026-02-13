import React, { useState, useEffect } from 'react';
import useSetWorkerAvailability from "../../hooks/worker/useSetWorkerAvailability";
import useWorkerProfile from "../../hooks/worker/useWorkerProfile";
import useAvailableTasks from "../../hooks/worker/useAvailableTasks";
import useAcceptTask from "../../hooks/worker/useAcceptTask";
import TaskDetailsModal from './TaskDetailsModal';
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
  Map as MapIcon
} from 'lucide-react';

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

const WorkerDashboard = () => {
  const { worker, loading: profileLoading, refetch: refetchProfile } = useWorkerProfile();
  const { setAvailability, loading: toggleLoading } = useSetWorkerAvailability();
  const { tasks, loading: tasksLoading, error: tasksError, fetchTasks, setError: setTasksError } = useAvailableTasks();
  const { acceptTask, loading: acceptLoading, error: acceptError } = useAcceptTask();
  
  // Local state
  const [isOnline, setIsOnline] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [customDistance, setCustomDistance] = useState("");
  const [isCustomDistance, setIsCustomDistance] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (worker) {
      setIsOnline(worker.isOnline);
    }
  }, [worker]);

  // Fetch tasks when online and location/distance changes
  useEffect(() => {
    if (isOnline && worker?.currentLocation?.coordinates) {
        const [lng, lat] = worker.currentLocation.coordinates;
        const distance = isCustomDistance && customDistance ? parseFloat(customDistance) : selectedDistance;
        
        // Only fetch if we have valid coordinates
        if (lat && lng) {
            fetchTasks({ lat, lng, distance });
        }
    }
  }, [isOnline, worker, selectedDistance, customDistance, isCustomDistance, fetchTasks]);

  const handleToggleAvailability = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus); // Optimistic update
      
      await setAvailability(newStatus);
      refetchProfile();
    } catch (error) {
      setIsOnline(!isOnline); // Revert on error
      console.error("Failed to toggle availability:", error);
    }
  };

  const handleDistanceChange = (value) => {
    setIsCustomDistance(false);
    setSelectedDistance(value);
  };

  const handleCustomDistanceSubmit = (e) => {
    e.preventDefault();
    if (customDistance && !isNaN(customDistance)) {
        setIsCustomDistance(true);
        // Effect will trigger fetch
    }
  };

  const calculateDistance = (taskLocation) => {
    if (!worker?.currentLocation?.coordinates || !taskLocation?.coordinates) return null;
    
    const [lng1, lat1] = worker.currentLocation.coordinates;
    const [lng2, lat2] = taskLocation.coordinates;
    
    // Haversine formula
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    
    return d.toFixed(1);
  };

  const handleAcceptTask = async (taskId) => {
    try {
        await acceptTask(taskId);
        setSelectedTask(null);
        // Refresh tasks and profile (availability might change)
        const [lng, lat] = worker.currentLocation.coordinates;
        const distance = isCustomDistance && customDistance ? parseFloat(customDistance) : selectedDistance;
        fetchTasks({ lat, lng, distance });
        refetchProfile();
    } catch (err) {
        console.error("Failed to accept task", err);
        // Error is handled by ErrorModal via acceptError if we pass it, or we can use local state
         setTasksError(err.message || "Failed to accept task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-black relative">
      <ErrorModal error={tasksError || acceptError} onClose={() => setTasksError(null)} />
      
      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onAccept={handleAcceptTask}
            accepting={acceptLoading}
        />
      )}

      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-black p-1.5 rounded-lg shadow-sm">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Workify <span className="text-gray-400">Pro</span></span>
        </div>

        <div className="flex items-center gap-6">
          {/* Availability Toggle */}
          <div className="flex items-center gap-3">
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
          </div>
          
          <div className="relative cursor-pointer">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full border-2 border-white"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-6 space-y-8">
        {/* Stats Grid - Keeping as is for now, maybe hook later */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black text-white p-6 rounded-3xl shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <Wallet size={24} className="text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Net Earnings</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">₹2,850</h2>
            <p className="text-gray-400 text-xs mt-2 font-medium">Earned this week after 15% commission</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4 text-gray-400">
              <Star size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Rating</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">{worker?.rating || "N/A"}</h2>
            <p className="text-gray-500 text-xs mt-2 font-medium">{worker?.completedTasks || 0} Completed Tasks</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4 text-gray-400">
              <CheckCircle size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Level</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-black uppercase">Pro</h2>
            <p className="text-gray-500 text-xs mt-2 font-medium italic">Eligible for High-Pay Tasks</p>
          </div>
        </div>

        {/* Dynamic Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-xl font-black uppercase tracking-tighter">Nearby Opportunities</h3>
              
              {/* Distance Filter */}
              {isOnline && (
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    {DISTANCE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleDistanceChange(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                !isCustomDistance && selectedDistance === opt.value 
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
                            className={`w-16 px-2 py-1 text-xs font-bold border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-black ${
                                isCustomDistance ? 'border-black bg-gray-50' : 'border-gray-200'
                            }`}
                        />
                        <button 
                            type="submit"
                            className={`px-2 py-1 rounded-r-lg text-[10px] font-bold uppercase tracking-widest border border-l-0 transition-all ${
                                isCustomDistance 
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

            {!isOnline ? (
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
                )})}
              </div>
            )}
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter">Account</h3>
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