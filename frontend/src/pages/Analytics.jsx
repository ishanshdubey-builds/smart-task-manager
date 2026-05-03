import { useEffect, useState } from 'react'
import API from '../api/api'
import StatCard from '../components/StatCard'
import { Doughnut, Line } from 'react-chartjs-2'

export default function Analytics() {
  const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0, completed: 0 })
  const [productivity, setProductivity] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/tasks/stats'),
      API.get('/tasks/productivity')
    ]).then(([s, p]) => {
      setStats(s.data)
      setProductivity(p.data.productivity)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>

  const remaining = Math.max(0, stats.monthly - stats.completed)
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daily Goals" value={stats.daily} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
        />
        <StatCard 
          title="Weekly Progress" value={stats.weekly} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        />
        <StatCard 
          title="Monthly Tasks" value={stats.monthly} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
        />
        <StatCard 
          title="Total Completed" value={stats.completed} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          colorClass="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Productivity Line Chart */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Productivity Score</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your efficiency over the last 7 days</p>
            </div>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{productivity.toFixed(1)}%</div>
          </div>
          <div className="relative h-64 w-full">
            <Line 
              options={{ 
                maintainAspectRatio: false, 
                scales: { 
                  y: { min: 0, max: 100 },
                  x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } },
                elements: { line: { tension: 0.4 } }
              }}
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                  label: 'Score',
                  data: [40, 50, 70, 65, 80, 90, productivity], // mock trend ending at actual productivity
                  borderColor: '#8B5CF6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  fill: true,
                  borderWidth: 2,
                }]
              }} 
            />
          </div>
        </div>

        {/* Completion Doughnut */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Completion Ratio</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Completed vs Remaining (Monthly)</p>
          </div>
          <div className="relative h-64 w-full flex justify-center">
            <Doughnut 
              options={{ 
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }
              }}
              data={{
                labels: ['Completed', 'Pending'],
                datasets: [{
                  data: stats.monthly === 0 ? [0, 1] : [stats.completed, remaining],
                  backgroundColor: stats.monthly === 0 ? ['#E5E7EB'] : ['#10B981', '#F97316'],
                  borderWidth: 0,
                  hoverOffset: 4
                }]
              }} 
            />
          </div>
        </div>

      </div>
    </div>
  )
}
