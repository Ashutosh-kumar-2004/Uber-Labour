import React from 'react';
import { MapPin, Plus, User, Briefcase, Star, Users, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const categories = [
    { 
      id: 1, 
      name: "Maintenance & Repair", 
      rating: 4.8,
      completed: "1.2k+",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800&sat=-100",
    },
    { 
      id: 2, 
      name: "Construction & Renovation", 
      rating: 4.9,
      completed: "850+",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800&sat=-100",
    },
    { 
      id: 3, 
      name: "Household & Lifestyle", 
      rating: 4.7,
      completed: "2.5k+",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800&sat=-100",
    },
    { 
      id: 5, 
      name: "Design & Installation", 
      rating: 4.9,
      completed: "400+",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800&sat=-100",
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
            <span className="text-2xl font-black tracking-tighter uppercase leading-none block">Workify</span>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase leading-none">Pro Network</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-md transition-all uppercase tracking-wider">
            <MapPin size={14} />
            Your Location
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-md transition-all shadow-md uppercase tracking-wider">
            <Plus size={14} />
            Create a Task
          </button>
          <div className="w-9 h-9 border-2 border-black rounded-full flex items-center justify-center ml-2 overflow-hidden cursor-pointer">
             <User size={18} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <header className="text-center md:text-left">
            <h1 className="text-5xl font-black mb-3 uppercase tracking-tighter">Our Services</h1>
            <p className="text-gray-500 text-xl font-medium italic">Quality help, when you need it.</p>
          </header>

          {/* Customer Reach / Stats */}
          <div className="flex justify-center md:justify-end gap-8 border-l-0 md:border-l border-gray-200 md:pl-8">
            <div className="text-center">
              <div className="flex items-center gap-1 text-black font-black text-2xl tracking-tighter">
                <Users size={20} /> 15k+
              </div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Active Workers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-black font-black text-2xl tracking-tighter">
                <CheckCircle size={20} /> 50k+
              </div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Tasks Done</p>
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
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">{item.completed} Jobs</span>
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
      </main>

      {/* Footer (Simplified) */}
      <footer className="border-t border-gray-100 py-10 px-6 mt-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400">
          <span className="text-lg font-black text-black uppercase tracking-tighter">Workify</span>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-black transition-colors">Safety</a>
            <a href="#" className="hover:text-black transition-colors">Support</a>
            <a href="#" className="hover:text-black transition-colors">Join as Worker</a>
          </div>
          <p className="text-[10px] font-bold uppercase">© 2026 WORKIFY</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;