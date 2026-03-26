/**
 * Patient Stats Component
 * 
 * Statistics overview dashboard for patient list.
 */

import type { PatientStats as PatientStatsType } from '../../types/patientList.types';

interface PatientStatsProps {
  stats: PatientStatsType;
}

export default function PatientStats({ stats }: PatientStatsProps) {
  const statusItems = [
    {
      label: 'Pre-Op',
      count: stats.preOp,
      color: 'bg-yellow-500',
      icon: '📋',
    },
    {
      label: 'In OR',
      count: stats.inOr,
      color: 'bg-red-500',
      icon: '🔪',
    },
    {
      label: 'PACU',
      count: stats.pacu,
      color: 'bg-orange-500',
      icon: '🏥',
    },
    {
      label: 'Floor',
      count: stats.floor,
      color: 'bg-blue-500',
      icon: '🛏️',
    },
    {
      label: 'Discharged',
      count: stats.discharged,
      color: 'bg-green-500',
      icon: '✅',
    },
    {
      label: 'Follow-Up',
      count: stats.followUp,
      color: 'bg-purple-500',
      icon: '📅',
    },
  ];

  return (
    <div className="bg-white border-b border-ayekta-border">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Total Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{stats.total}</h2>
              <p className="text-sm text-gray-600 mt-1">Total Patients</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">{stats.todayCount}</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">{stats.weekCount}</p>
                <p className="text-xs text-gray-500">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{item.icon}</span>
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="mt-6">
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
              {statusItems.map((item) => {
                const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                return (
                  <div
                    key={item.label}
                    className={`${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                    title={`${item.label}: ${item.count}`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Patient distribution across surgical workflow
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
