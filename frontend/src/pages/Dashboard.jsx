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
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Calendar</h3>
        <span className="text-gray-400 text-sm font-medium">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-500 uppercase">
        {days.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {blanks.map(b => <div key={`blank-${b}`} className="text-transparent">0</div>)}
        {dates.map(date => (
          <div 
            key={date} 
            className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
              date === today.getDate() 
                ? 'bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.6)]' 
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
        API.get('/api/tasks/stats'),
        API.get('/api/tasks/productivity'),
        API.get('/api/tasks')
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
      const res = await API.post('/api/tasks', newTask)
      setTasks([res.data, ...tasks])
      setNewTask({ title: '', type: 'personal', assignedToEmail: '', dueDate: todayStr })
      
      const [s, p] = await Promise.all([
        API.get('/api/tasks/stats'),
        API.get('/api/tasks/productivity')
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
      const res = await API.put(`/api/tasks/${taskId}`, { completed: !currentStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
      
      const [s, p] = await Promise.all([
        API.get('/api/tasks/stats'),
        API.get('/api/tasks/productivity')
      ])
      setStats(s.data)
      setProductivity(p.data.productivity)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/api/tasks/${taskId}`)
      setTasks(tasks.filter(t => t._id !== taskId))
      
      const [s, p] = await Promise.all([
        API.get('/api/tasks/stats'),
        API.get('/api/tasks/productivity')
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19]">
        <svg className="animate-spin h-10 w-10 text-purple-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-8">
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
              title="Total Tasks" value={totalTasks} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
              colorClass="bg-purple-500/20 text-purple-400"
              shadowClass="shadow-[0_0_30px_rgba(139,92,246,0.1)]"
            />
            <StatCard 
              title="Pending" value={pendingTasks} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              colorClass="bg-orange-500/20 text-orange-400"
              shadowClass="shadow-[0_0_30px_rgba(249,115,22,0.1)]"
            />
            <StatCard 
              title="Completed" value={completedTasks} 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              colorClass="bg-green-500/20 text-green-400"
              shadowClass="shadow-[0_0_30px_rgba(34,197,94,0.1)]"
            />
            <StatCard 
              title="Current Streak" value={`${streak} ${streak === 1 ? 'Day' : 'Days'}`} 
              icon={<span className="text-2xl">🔥</span>}
              colorClass="bg-orange-500/20 text-orange-400"
              shadowClass="shadow-[0_0_30px_rgba(249,115,22,0.1)]"
            />
          </div>

          {/* MAIN GRID: Task List vs (Calendar + Charts) */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* TASKS COLUMN */}
            <div className="flex-1 min-w-0 max-w-full overflow-hidden space-y-6">
              
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-white tracking-wide">Tasks for Today</h2>
                  <div className="flex gap-2">
                    {['All', 'Pending', 'Completed', 'Assigned to me'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filter === f 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
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
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
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
                    className="bg-white/5 border border-white/10 text-white rounded-xl px-4 outline-none appearance-none cursor-pointer"
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
                      className="w-48 p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  )}
                  <input 
                    type="date"
                    min={todayStr}
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={creatingTask || !newTask.title.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 px-6 font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
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
                              className="group relative overflow-hidden z-10 flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <button 
                                  onClick={() => handleToggleComplete(task._id, task.completed)}
                                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                    task.completed 
                                      ? 'bg-green-500 border-green-500 text-white' 
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
                                      task.type === 'team' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
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
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  task.completed ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
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
            <div className="w-full lg:w-[350px] shrink-0 space-y-8">
              
              <CalendarWidget />

              {/* Productivity Line Chart */}
              <div className="p-4 rounded-xl bg-white/5 dark:bg-[#111827] backdrop-blur-lg border border-white/10 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4">Productivity Trend</h3>
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
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Task Completion</h3>
                <div className="relative h-48 w-full flex justify-center">
                  <Doughnut 
                    options={{ 
                      maintainAspectRatio: false,
                      cutout: '75%',
                      plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', usePointStyle: true } } }
                    }}
                    data={{
                      labels: ['Completed', 'Pending'],
                      datasets: [{
                        data: totalTasks === 0 ? [0, 1] : [completedTasks, pendingTasks],
                        backgroundColor: totalTasks === 0 ? ['#1F2937'] : ['#10B981', '#F97316'],
                        borderWidth: 0,
                        hoverOffset: 4
                      }]
                    }} 
                  />
                  {totalTasks > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                      <span className="text-3xl font-bold text-white">{Math.round((completedTasks/totalTasks)*100)}%</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

    </div>
  )
}