import { useState, useEffect } from 'react'
import API from '../api/api'

export default function CalendarView() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [loadingSelected, setLoadingSelected] = useState(false)

  useEffect(() => {
    API.get('/tasks').then(res => {
      setTasks(res.data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const handleDateClick = async (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const today = new Date()
    today.setHours(0,0,0,0)

    if (clickedDate < today) return

    setSelectedDate(clickedDate)
    setLoadingSelected(true)
    
    // Format to YYYY-MM-DD
    const yyyy = clickedDate.getFullYear()
    const mm = String(clickedDate.getMonth() + 1).padStart(2, '0')
    const dd = String(clickedDate.getDate()).padStart(2, '0')
    
    try {
      const res = await API.get(`/tasks/by-date?date=${yyyy}-${mm}-${dd}`)
      setSelectedTasks(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSelected(false)
    }
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Helper to find tasks for a specific day
  const getTasksForDay = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dStr = d.toLocaleDateString('en-CA')
    
    return tasks.filter(t => {
      if (!t.dueDate) return false
      const tDateStr = t.dueDate.split('T')[0]
      return tDateStr === dStr
    })
  }

  const blanks = Array.from({length: firstDayOfMonth}, (_, i) => i)
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1)
  const today = new Date()

  if (loading) return <div className="p-8 text-center text-gray-500">Loading calendar...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h2>
        <div className="flex items-center gap-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-2 rounded-xl shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <span className="font-bold text-gray-900 dark:text-white min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-gray-500 text-sm uppercase tracking-wider">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="h-32 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 opacity-50"></div>
          ))}
          
          {days.map(day => {
            const dayTasks = getTasksForDay(day)
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
            const isSelected = selectedDate && day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear()
            
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const isPast = cellDate < new Date().setHours(0,0,0,0)

            return (
              <div 
                key={day} 
                onClick={() => !isPast && handleDateClick(day)}
                className={`h-32 rounded-2xl border p-2 flex flex-col transition-all overflow-hidden ${
                  isPast 
                    ? 'bg-gray-100/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer'
                    : isToday 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer' 
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent hover:border-gray-300 dark:hover:border-white/20 cursor-pointer'
                }`}
              >
                <div className={`text-right font-bold text-sm mb-1 ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {day}
                  {dayTasks.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task._id} 
                      className={`text-[10px] font-semibold px-2 py-1 rounded truncate ${
                        task.completed ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 line-through' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-gray-400 font-medium text-center">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Tasks View */}
      {selectedDate && (
        <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Tasks for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          
          {loadingSelected ? (
            <div className="py-8 text-center text-gray-500">Loading tasks...</div>
          ) : selectedTasks.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No tasks due on this date.</div>
          ) : (
            <div className="space-y-4">
              {selectedTasks.map(task => (
                <div key={task._id} className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <div className="flex-1">
                    <p className={`font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{task.title}</p>
                    <p className="text-xs text-gray-500">{task.type === 'team' ? 'Team Task' : 'Personal Task'}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${task.completed ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                    {task.completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
