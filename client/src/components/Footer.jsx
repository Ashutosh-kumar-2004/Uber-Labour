import React from "react";
import { Briefcase } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-xl">
            <Briefcase size={18} />
          </div>

          <span className="font-bold">Workify</span>
        </div>

        <div className="flex gap-6 text-gray-600">
          <a href="#" className="hover:text-blue-600 transition">Terms</a>
          <a href="#" className="hover:text-blue-600 transition">Privacy</a>
          <a href="#" className="hover:text-blue-600 transition">Contact</a>
        </div>

        <div className="text-gray-500 text-sm">© {new Date().getFullYear()} Workify. All rights reserved.</div>
      </div>
    </footer>
  );
}
