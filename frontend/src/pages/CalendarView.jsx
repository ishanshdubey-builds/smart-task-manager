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
    API.get('tasks').then(res => {
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
    const yyyy = clickedDate.getFullYear()
    const mm = String(clickedDate.getMonth() + 1).padStart(2, '0')
    const dd = String(clickedDate.getDate()).padStart(2, '0')
    try {
      const res = await API.get(`tasks/by-date?date=${yyyy}-${mm}-${dd}`)
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
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const getTasksForDay = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dStr = d.toLocaleDateString('en-CA')
    return tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dStr)
  }
  const blanks = Array.from({length: firstDayOfMonth}, (_, i) => i)
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1)
  const today = new Date()

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading calendar…</div>

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="eyebrow mb-3">Time / commitments</p><h2 className="editorial-display text-4xl dark:text-[#eeece6] sm:text-5xl">Calendar</h2></div>
        <div className="flex items-center gap-5 border-y border-black/10 py-3 dark:border-white/10">
          <button onClick={prevMonth} aria-label="Previous month" className="px-2 py-1 text-zinc-500 transition-colors hover:text-black dark:hover:text-white">←</button>
          <span className="min-w-[145px] text-center text-[11px] font-semibold uppercase tracking-[.14em] text-zinc-700 dark:text-zinc-300">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={nextMonth} aria-label="Next month" className="px-2 py-1 text-zinc-500 transition-colors hover:text-black dark:hover:text-white">→</button>
        </div>
      </div>
      <div className="overflow-hidden border-y border-black/10 dark:border-white/10">
        <div className="grid grid-cols-7 border-b border-black/10 dark:border-white/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="px-2 py-4 text-center text-[9px] font-semibold uppercase tracking-[.16em] text-zinc-500 sm:px-4 sm:text-left">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {blanks.map(b => <div key={`blank-${b}`} className="min-h-[90px] border-b border-r border-black/[0.06] dark:border-white/[0.045] sm:min-h-[132px]" />)}
          {days.map(day => {
            const dayTasks = getTasksForDay(day)
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
            const isSelected = selectedDate && day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear()
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const isPast = cellDate < new Date().setHours(0,0,0,0)
            return (
              <button type="button" key={day} onClick={() => !isPast && handleDateClick(day)} disabled={isPast}
                className={`group min-h-[90px] border-b border-r border-black/[0.06] p-2 text-left transition-colors dark:border-white/[0.045] sm:min-h-[132px] sm:p-4 ${isPast ? 'cursor-not-allowed opacity-30' : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.025]'} ${isSelected ? 'bg-[#b9a47b]/[0.10]' : ''}`}>
                <div className="mb-2 flex items-start justify-between gap-1">
                  <span className={`editorial-display text-xl sm:text-2xl ${isToday ? 'text-[#b9a47b]' : 'text-zinc-700 dark:text-zinc-300'}`}>{day}</span>
                  {dayTasks.length > 0 && <span className="mt-1 border border-zinc-300 px-1.5 py-0.5 text-[9px] tabular-nums text-zinc-500 dark:border-zinc-700">{dayTasks.length}</span>}
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map(task => <div key={task._id} className={`truncate border-l-2 pl-1.5 text-[9px] leading-5 sm:text-[10px] ${task.completed ? 'border-[#77746c] text-zinc-500 line-through' : 'border-[#b9a47b] text-zinc-600 dark:text-zinc-400'}`} title={task.title}>{task.title}</div>)}
                  {dayTasks.length > 2 && <div className="text-[9px] text-zinc-500">+{dayTasks.length - 2} more</div>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      {selectedDate && (
        <section className="border-t border-black/10 pt-6 dark:border-white/10">
          <p className="eyebrow mb-2">Selected date</p>
          <h3 className="editorial-display mb-6 text-2xl dark:text-[#eeece6]">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
          {loadingSelected ? <div className="py-8 text-sm text-zinc-500">Loading tasks…</div> : selectedTasks.length === 0 ? <div className="py-8 text-sm text-zinc-500">No tasks due on this date.</div> : (
            <div className="divide-y divide-black/10 dark:divide-white/10">
              {selectedTasks.map(task => (
                <div key={task._id} className="flex items-center gap-4 py-4">
                  <span className={`h-1.5 w-1.5 ${task.completed ? 'bg-[#77746c]' : 'bg-[#b9a47b]'}`} />
                  <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-800 dark:text-zinc-200'}`}>{task.title}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{task.type === 'team' ? 'Team task' : 'Personal task'}</p></div>
                  <span className="text-[10px] uppercase tracking-[.14em] text-zinc-500">{task.completed ? 'Done' : 'Pending'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
