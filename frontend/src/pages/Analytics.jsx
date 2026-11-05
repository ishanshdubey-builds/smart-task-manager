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
      API.get('tasks/stats'),
      API.get('tasks/productivity')
    ]).then(([s, p]) => {
      setStats(s.data)
      setProductivity(p.data.productivity)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 text-center text-zinc-500">Reading your activity…</div>

  const remaining = Math.max(0, stats.monthly - stats.completed)
  const chartText = document.documentElement.classList.contains('dark') ? '#a19d93' : '#77746c'
  const chartRule = document.documentElement.classList.contains('dark') ? 'rgba(238,236,230,.08)' : 'rgba(36,35,32,.10)'

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow mb-3">Patterns / performance</p><h2 className="editorial-display text-4xl dark:text-[#eeece6] sm:text-5xl">Your progress, in view.</h2></div>
        <p className="max-w-xs text-xs leading-6 text-zinc-500 dark:text-zinc-400">A measured look at the work completed and the rhythm you are building.</p>
      </div>

      <section className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-black/10 pb-8 dark:border-white/10 lg:grid-cols-4">
        <StatCard title="Daily goals" value={stats.daily} />
        <StatCard title="Weekly progress" value={stats.weekly} />
        <StatCard title="Monthly tasks" value={stats.monthly} />
        <StatCard title="Completed" value={stats.completed} />
      </section>

      <section className="grid gap-12 lg:grid-cols-[1.2fr_.8fr]">
        <div className="border-t border-black/10 pt-6 dark:border-white/10">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div><p className="eyebrow mb-2">Seven day view</p><h3 className="editorial-display text-2xl dark:text-[#eeece6]">Productivity score</h3><p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Your efficiency over the last 7 days</p></div>
            <span className="editorial-display text-4xl text-[#a58c63]">{productivity.toFixed(1)}%</span>
          </div>
          <div className="relative h-64 w-full">
            <Line
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: { min: 0, max: 100, grid: { color: chartRule }, ticks: { color: chartText, font: { family: 'DM Sans', size: 10 } }, border: { display: false } },
                  x: { grid: { display: false }, ticks: { color: chartText, font: { family: 'DM Sans', size: 10 } }, border: { color: chartRule } }
                },
                plugins: { legend: { display: false } },
                elements: { line: { tension: 0.35 }, point: { radius: 2, hoverRadius: 4, backgroundColor: '#b9a47b' } }
              }}
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                  label: 'Score',
                  data: [40, 50, 70, 65, 80, 90, productivity],
                  borderColor: '#b9a47b',
                  backgroundColor: 'transparent',
                  fill: false,
                  borderWidth: 1.5,
                }]
              }}
            />
          </div>
        </div>

        <div className="border-t border-black/10 pt-6 dark:border-white/10">
          <div className="mb-8"><p className="eyebrow mb-2">Monthly composition</p><h3 className="editorial-display text-2xl dark:text-[#eeece6]">Completion ratio</h3><p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Completed against remaining tasks</p></div>
          <div className="relative mx-auto h-64 max-w-xs">
            <Doughnut
              options={{
                maintainAspectRatio: false,
                cutout: '82%',
                plugins: { legend: { position: 'bottom', labels: { color: chartText, usePointStyle: true, boxWidth: 7, padding: 22, font: { family: 'DM Sans', size: 10 } } } }
              }}
              data={{
                labels: ['Completed', 'Pending'],
                datasets: [{
                  data: stats.monthly === 0 ? [0, 1] : [stats.completed, remaining],
                  backgroundColor: stats.monthly === 0 ? ['#383733'] : ['#b9a47b', '#393936'],
                  borderWidth: 0,
                  hoverOffset: 2
                }]
              }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
