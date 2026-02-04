import React, { useState } from 'react';
import { 
  Briefcase, 
  Power, 
  Wallet, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle,
  Bell,
  ArrowUpRight
} from 'lucide-react';

const WorkerDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);

  const nearbyTasks = [
    {
      id: 1,
      category: "Maintenance",
      title: "Fix Leaky Kitchen Pipe",
      distance: "1.2 km",
      pay: "₹350",
      duration: "1 hr",
      difficulty: "Beginner Friendly"
    },
    {
      id: 2,
      category: "Construction",
      title: "Debris Removal - Site B",
      distance: "3.5 km",
      pay: "₹600",
      duration: "3 hrs",
      difficulty: "High Effort"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-black">
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
              onClick={() => setIsOnline(!isOnline)}
              className={`w-14 h-8 rounded-full flex items-center p-1 transition-all duration-300 ${isOnline ? 'bg-black' : 'bg-gray-200'}`}
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
        {/* Stats Grid */}
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
            <h2 className="text-4xl font-black tracking-tighter">4.9</h2>
            <p className="text-gray-500 text-xs mt-2 font-medium">18 Completed Tasks</p>
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
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter">Nearby Opportunities</h3>
              <div className="h-[1px] flex-grow mx-4 bg-gray-200"></div>
            </div>

            {!isOnline ? (
              <div className="bg-gray-100 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">Go Online to see available tasks in your area</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyTasks.map((task) => (
                  <div key={task.id} className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-black transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded">{task.category}</span>
                        <span className="text-gray-400 text-[10px] font-bold italic">{task.difficulty}</span>
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tighter">{task.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-gray-500 text-xs">
                        <div className="flex items-center gap-1"><MapPin size={14} /> {task.distance}</div>
                        <div className="flex items-center gap-1"><Clock size={14} /> {task.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-black tracking-tighter">{task.pay}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">You Keep 85%</p>
                      </div>
                      <button className="bg-black text-white p-4 rounded-xl hover:bg-zinc-800 transition-all">
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
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