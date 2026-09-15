import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import JobInput from '../components/JobInput';

export default function NewJob() {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
          <JobInput />
        </main>
      </div>
    </div>
  );
}
