
import React, { useState } from 'react';

interface StageData {
  stage: string;
  appeared: number;
  selected: number;
  rejected: number;
  dropOff: number;
  avgDuration: number; // in days
  avgScore: number; // out of 5
}

const STAGE_METRICS: StageData[] = [
  { stage: 'Level 1 Technical', appeared: 450, selected: 280, rejected: 140, dropOff: 30, avgDuration: 3, avgScore: 3.8 },
  { stage: 'Level 2 Technical', appeared: 280, selected: 150, rejected: 110, dropOff: 20, avgDuration: 4, avgScore: 3.6 },
  { stage: 'Level 3 Technical', appeared: 150, selected: 90, rejected: 45, dropOff: 15, avgDuration: 5, avgScore: 3.9 },
  { stage: 'Level 4 Technical', appeared: 90, selected: 52, rejected: 30, dropOff: 8, avgDuration: 6, avgScore: 4.1 },
  { stage: 'HR Round', appeared: 52, selected: 45, rejected: 2, dropOff: 5, avgDuration: 2, avgScore: 4.3 },
  { stage: 'Management Round', appeared: 45, selected: 38, rejected: 2, dropOff: 5, avgDuration: 3, avgScore: 4.2 },
];

const StageAnalytics: React.FC = () => {
  const getStageColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-blue-600', 'bg-slate-600', 
      'bg-slate-700', 'bg-blue-700', 'bg-slate-800'
    ];
    return colors[index] || 'bg-slate-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interview Stage Analytics</h1>
          <p className="text-slate-500 text-sm">Comprehensive performance analysis across all interview stages with conversion rates and insights.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
            <i className="fa-solid fa-download"></i> Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-users text-xl"></i>
            </div>
            <span className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total</span>
          </div>
          <p className="text-3xl font-black mb-1">450</p>
          <p className="text-blue-100 text-sm font-medium">Candidates Started</p>
        </div>

        <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-check-circle text-xl"></i>
            </div>
            <span className="text-slate-200 text-xs font-bold uppercase tracking-wider">Success</span>
          </div>
          <p className="text-3xl font-black mb-1">38</p>
          <p className="text-slate-200 text-sm font-medium">Final Selections</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-percentage text-xl"></i>
            </div>
            <span className="text-blue-100 text-xs font-bold uppercase tracking-wider">Rate</span>
          </div>
          <p className="text-3xl font-black mb-1">8.4%</p>
          <p className="text-blue-100 text-sm font-medium">Overall Conversion</p>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-clock text-xl"></i>
            </div>
            <span className="text-slate-200 text-xs font-bold uppercase tracking-wider">Average</span>
          </div>
          <p className="text-3xl font-black mb-1">23</p>
          <p className="text-slate-200 text-sm font-medium">Days to Complete</p>
        </div>
      </div>

      {/* Funnel View */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">Interview Stage Conversion Funnel</h3>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          {STAGE_METRICS.map((data, idx) => {
            const width = (data.appeared / STAGE_METRICS[0].appeared) * 100;
            const selectionRate = ((data.selected / data.appeared) * 100).toFixed(1);
            
            return (
              <div key={idx} className="relative">
                <div className="flex items-center gap-6">
                  <div className="w-36 text-right">
                    <p className="text-sm font-bold text-gray-900">{data.stage}</p>
                    <p className="text-xs text-gray-600 font-medium">Stage {idx + 1}</p>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="h-16 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                      <div 
                        className={`h-full ${getStageColor(idx)} transition-all duration-1000 rounded-lg flex items-center justify-between px-4 text-white`}
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-sm font-bold drop-shadow-sm">{data.appeared} candidates</span>
                        <span className="text-sm font-bold drop-shadow-sm">{selectionRate}% success</span>
                      </div>
                    </div>
                    
                    {/* Conversion Arrow */}
                    {idx < STAGE_METRICS.length - 1 && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                          <i className="fa-solid fa-arrow-down text-xs text-white"></i>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-28 text-center">
                    <p className="text-xl font-bold text-gray-900">{data.selected}</p>
                    <p className="text-xs text-gray-600 font-medium">Selected</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StageAnalytics;
