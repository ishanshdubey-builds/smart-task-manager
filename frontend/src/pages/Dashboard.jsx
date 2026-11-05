import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/api'
import StatCard from '../components/StatCard'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

// Helper to decode JWT and get user ID
const getMyUserId = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.id
  } catch (e) {
    return null
  }
}

// Grouping Helper
const groupTasksByDate = (tasks) => {
  const groups = {
    'Today': [],
    'Upcoming': [],
    'Past': [],
    'Completed': []
  }
  
  const todayLocal = new Date()
  const todayStr = todayLocal.toLocaleDateString('en-CA')

  tasks.forEach(task => {
    if (task.completed) {
      groups['Completed'].push(task)
      return
    }

    if (task.dueDate) {
      const taskDateStr = task.dueDate.split('T')[0]
      if (taskDateStr === todayStr) groups['Today'].push(task)
      else if (taskDateStr < todayStr) groups['Past'].push(task)
      else groups['Upcoming'].push(task)
    } else {
      groups['Today'].push(task)
    }
  })

  return groups
}

// Custom Calendar UI component
const CalendarWidget = () => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = new Date();
  
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  const blanks = Array.from({length: firstDayOfMonth}, (_, i) => i);
  const dates = Array.from({length: daysInMonth}, (_, i) => i + 1);

  return (
    <div className="bg-transparent border-t border-white/[0.08] p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="editorial-display text-2xl text-zinc-100">Calendar</h3>
        <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-500 uppercase">
        {days.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {blanks.map(b => <div key={`blank-${b}`} className="text-transparent">0</div>)}
        {dates.map(date => (
          <div 
            key={date} 
            className={`w-8 h-8 flex items-center justify-center rounded-sm mx-auto ${
              date === today.getDate() 
                ? 'bg-[#b9a47b] text-[#111] font-bold' 
                : 'text-gray-300 hover:bg-white/10 cursor-pointer transition-colors'
            }`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0, completed: 0 })
  const [productivity, setProductivity] = useState(0)
  
  // Task state
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const todayStr = new Date().toLocaleDateString('en-CA')
  const [newTask, setNewTask] = useState({ title: '', type: 'personal', assignedToEmail: '', dueDate: todayStr })
  const [creatingTask, setCreatingTask] = useState(false)
  const [formError, setFormError] = useState('')

  const myId = getMyUserId()
  const user = JSON.parse(localStorage.getItem('user'))
  const streak = user?.streak || 1

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [s, p, t] = await Promise.all([
        API.get('tasks/stats'),
        API.get('tasks/productivity'),
        API.get('tasks')
      ])
      setStats(s.data || { daily: 0, weekly: 0, monthly: 0, completed: 0 })
      setProductivity(p.data?.productivity || 0)
      setTasks(t.data || [])
    } catch (err) {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!newTask.title.trim()) return

    if (newTask.dueDate < todayStr) {
      setFormError('Cannot assign tasks to past dates')
      return
    }

    setCreatingTask(true)
    try {
      const res = await API.post('tasks', newTask)
      setTasks([res.data, ...tasks])
      setNewTask({ title: '', type: 'personal', assignedToEmail: '', dueDate: todayStr })
      
      const [s, p] = await Promise.all([
        API.get('tasks/stats'),
        API.get('tasks/productivity')
      ])
      setStats(s.data)
      setProductivity(p.data.productivity)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setCreatingTask(false)
    }
  }

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const res = await API.put(`tasks/${taskId}`, { completed: !currentStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
      
      const [s, p] = await Promise.all([
        API.get('tasks/stats'),
        API.get('tasks/productivity')
      ])
      setStats(s.data)
      setProductivity(p.data.productivity)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`tasks/${taskId}`)
      setTasks(tasks.filter(t => t._id !== taskId))
      
      const [s, p] = await Promise.all([
        API.get('tasks/stats'),
        API.get('tasks/productivity')
      ])
      setStats(s.data)
      setProductivity(p.data.productivity)
    } catch (err) {
      console.error(err)
    }
  }

  // Calculated Stats from actual tasks for the Cards
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter(t => !t.completed).length
  const completedTasks = tasks.filter(t => t.completed).length
  const assignedTasks = tasks.filter(t => t.assignedTo && (t.assignedTo._id === myId || t.assignedTo === myId)).length

  const filteredTasks = tasks.filter(task => {
    if (filter === 'Completed') return task.completed
    if (filter === 'Pending') return !task.completed
    if (filter === 'Assigned to me') return task.assignedTo && (task.assignedTo._id === myId || task.assignedTo === myId)
    return true
  })

  const groupedTasks = groupTasksByDate(filteredTasks)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0e]">
        <svg className="animate-spin h-10 w-10 text-[#b9a47b] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="mb-2"><p className="eyebrow mb-3">Today / at a glance</p><h2 className="editorial-display text-4xl text-zinc-900 dark:text-[#eeece6] sm:text-5xl">A day in progress.</h2></div>
          {/* STATS ROW */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-black/10 pb-8 dark:border-white/10 lg:grid-cols-4">
            <StatCard 
              title="Total Tasks" value={totalTasks} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
              colorClass="bg-[#b9a47b]/20 text-[#c9b58e]"
              
            />
            <StatCard 
              title="Pending" value={pendingTasks} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              
              
            />
            <StatCard 
              title="Completed" value={completedTasks} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              
              
            />
            <StatCard 
              title="Current Streak" value={`${streak} ${streak === 1 ? 'Day' : 'Days'}`} 
              icon={<span className="text-2xl">🔥</span>}
              
              
            />
          </div>

          {/* MAIN GRID: Task List vs (Calendar + Charts) */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            
            {/* TASKS COLUMN */}
            <div className="flex-1 min-w-0 max-w-full overflow-hidden space-y-6">
              
              <div className="bg-transparent border-y border-white/[0.08] py-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="editorial-display text-2xl text-zinc-100">Tasks for Today</h2>
                  <div className="flex gap-2">
                    {['All', 'Pending', 'Completed', 'Assigned to me'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-wider font-semibold transition-all ${
                          filter === f 
                            ? 'bg-[#b9a47b]/10 text-[#c8b58f] border border-[#b9a47b]/25' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ADD TASK FORM */}
                <form onSubmit={handleCreateTask} className="mb-6 flex gap-3">
                  <div className="flex-1 bg-white/[0.025] border border-white/[0.08] rounded-sm flex items-center px-4 focus-within:border-[#b9a47b]/60 transition-all">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <input
                      type="text"
                      placeholder="Add a new task..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="w-full p-3 bg-transparent text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                  <select 
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                    className="bg-white/[0.025] border border-white/[0.08] text-zinc-200 rounded-sm px-4 outline-none appearance-none cursor-pointer"
                  >
                    <option value="personal" className="bg-gray-900 text-white">Personal</option>
                    <option value="team" className="bg-gray-900 text-white">Team</option>
                  </select>
                  {newTask.type === 'team' && (
                    <input
                      type="email"
                      placeholder="Assignee Email"
                      value={newTask.assignedToEmail}
                      onChange={(e) => setNewTask({...newTask, assignedToEmail: e.target.value})}
                      className="w-48 p-3 bg-white/[0.025] border border-white/[0.08] rounded-sm text-white outline-none"
                    />
                  )}
                  <input 
                    type="date"
                    min={todayStr}
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="bg-white/[0.025] border border-white/[0.08] text-zinc-200 rounded-sm px-4 py-3 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={creatingTask || !newTask.title.trim()}
                    className="bg-[#e9e5dc] hover:bg-white disabled:bg-[#e9e5dc]/50 text-[#171715] px-6 font-bold rounded-xl shadow-[0_0_20px_rgba(185,164,123,0.12)] transition-all"
                  >
                    Add
                  </button>
                </form>

                {formError && <p className="text-red-400 text-sm mb-4">{formError}</p>}

                {/* TASK LIST */}
                <div className="space-y-6">
                  {filteredTasks.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <p>No tasks found in this view.</p>
                    </div>
                  ) : (
                    Object.keys(groupedTasks).map(groupName => {
                      const groupItems = groupedTasks[groupName]
                      if (groupItems.length === 0) return null

                      return (
                        <div key={groupName} className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                            {groupName}
                          </h4>
                          {groupItems.map(task => (
                            <div 
                              key={task._id} 
                              className="group relative overflow-hidden z-10 flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <button 
                                  onClick={() => handleToggleComplete(task._id, task.completed)}
                                  className={`w-6 h-6 rounded-sm border flex items-center justify-center transition-all ${
                                    task.completed 
                                      ? 'bg-[#b9a47b] border-[#b9a47b] text-[#111]' 
                                      : 'border-gray-500 hover:border-green-400'
                                  }`}
                                >
                                  {task.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                </button>
                                
                                <div>
                                  <h4 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                    {task.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center ${
                                      task.type === 'team' ? 'bg-white/[0.04] text-zinc-300 border border-white/[0.08]' : 'bg-white/[0.04] text-zinc-300 border border-white/[0.08]'
                                    }`}>
                                      {task.type}
                                    </span>
                                    {task.type === 'team' && task.assignedTo && (
                                      <span className="text-[10px] text-gray-500 font-medium">
                                        Assigned: {task.assignedTo.email || task.assignedTo}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-sm ${
                                  task.completed ? 'bg-white/[0.04] text-zinc-300' : 'bg-[#b9a47b]/10 text-[#c9b58e]'
                                }`}>
                                  {task.completed ? 'Completed' : 'Pending'}
                                </span>
                                
                                <button 
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full min-w-0 space-y-8">
              
              <CalendarWidget />

              {/* Productivity Line Chart */}
              <div className="p-4 bg-transparent border-t border-white/[0.08] overflow-hidden">
                <h3 className="editorial-display text-2xl text-zinc-100 mb-4">Productivity trend</h3>
                <div className="relative h-48 w-full">
                  <Line 
                    options={{ 
                      maintainAspectRatio: false, 
                      scales: { 
                        y: { display: false, min: 0, max: 100 },
                        x: { display: false }
                      },
                      plugins: { legend: { display: false } },
                      elements: { line: { tension: 0.4 } }
                    }}
                    data={{
                      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                      datasets: [{
                        label: 'Score',
                        data: [40, 50, 70, 65, 80, 90, productivity], // mock trend ending at actual productivity
                        borderColor: '#b9a47b',
                        backgroundColor: 'rgba(185, 164, 123, 0)',
                        fill: false,
                        borderWidth: 2,
                      }]
                    }} 
                  />
                </div>
              </div>

              {/* Completion Doughnut */}
              <div className="bg-transparent border-t border-white/[0.08] p-6">
                <h3 className="editorial-display text-2xl text-zinc-100 mb-4">Task completion</h3>
                <div className="relative h-48 w-full flex justify-center">
                  <Doughnut 
                    options={{ 
                      maintainAspectRatio: false,
                      cutout: '75%',
                      plugins: { legend: { position: 'bottom', labels: { color: '#a19d93', usePointStyle: true, boxWidth: 7, font: { family: 'DM Sans', size: 10 } } } }
                    }}
                    data={{
                      labels: ['Completed', 'Pending'],
                      datasets: [{
                        data: totalTasks === 0 ? [0, 1] : [completedTasks, pendingTasks],
                        backgroundColor: totalTasks === 0 ? ['#393936'] : ['#b9a47b', '#393936'],
                        borderWidth: 0,
                        hoverOffset: 4
                      }]
                    }} 
                  />
                  {totalTasks > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                      <span className="editorial-display text-4xl text-zinc-100">{Math.round((completedTasks/totalTasks)*100)}%</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

    </div>
  )
}