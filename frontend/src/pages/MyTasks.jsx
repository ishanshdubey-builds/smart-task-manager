import { useState, useEffect } from 'react'
import API from '../api/api'

const groupTasks = (tasks) => {
  const groups = { 'Today': [], 'Upcoming': [], 'Past': [], 'Completed': [] }
  const todayLocal = new Date()
  const todayStr = todayLocal.toLocaleDateString('en-CA')
  tasks.forEach(task => {
    if (task.completed) { groups['Completed'].push(task); return }
    if (task.dueDate) {
      const taskDateStr = task.dueDate.split('T')[0]
      if (taskDateStr === todayStr) groups['Today'].push(task)
      else if (taskDateStr < todayStr) groups['Past'].push(task)
      else groups['Upcoming'].push(task)
    } else groups['Today'].push(task)
  })
  return groups
}

export default function MyTasks() {
  const todayStr = new Date().toLocaleDateString('en-CA')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({ title: '', dueDate: todayStr })
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    try {
      const res = await API.get('tasks')
      const myId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id
      setTasks(res.data.filter(t => t.userId === myId && t.type === 'personal'))
      setLoading(false)
    } catch (err) { console.error(err); setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    if (newTask.dueDate < todayStr) { setFormError('Cannot assign tasks to past dates'); return }
    setCreating(true)
    try {
      const payload = { title: newTask.title, type: 'personal', dueDate: newTask.dueDate || todayStr }
      const res = await API.post('tasks', payload)
      setTasks([res.data, ...tasks])
      setNewTask({ title: '', dueDate: todayStr })
    } catch (err) { console.error(err) } finally { setCreating(false) }
  }

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      const res = await API.put(`tasks/${taskId}`, { completed: !currentStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
    } catch (err) { console.error(err) }
  }

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`tasks/${taskId}`)
      setTasks(tasks.filter(t => t._id !== taskId))
    } catch (err) { console.error(err) }
  }

  const groupedTasks = groupTasks(tasks)
  if (loading) return <div className="p-8 text-center text-zinc-500">Loading tasks…</div>

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow mb-3">Personal work / task register</p><h2 className="editorial-display text-4xl dark:text-[#eeece6] sm:text-5xl">My tasks</h2></div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{tasks.length} entries in your register</p>
      </div>
      <section className="border-y border-black/10 py-5 dark:border-white/10">
        <form onSubmit={handleCreate} className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-3">
            <span className="text-lg text-[#a58c63]">＋</span>
            <input type="text" placeholder="Write down the next action…" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="workspace-input min-w-0 border-0 border-b border-black/15 bg-transparent px-1 py-3 text-sm focus:border-[#b9a47b] dark:border-white/10" required />
          </div>
          <input type="date" min={todayStr} value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="workspace-input w-full px-3 py-3 text-xs md:w-auto" />
          <button type="submit" disabled={creating || !newTask.title.trim()} className="editorial-button bg-[#242320] px-7 py-3 text-xs font-semibold uppercase tracking-[.14em] text-[#f5f3ee] hover:bg-black disabled:opacity-60 dark:bg-[#eeece6] dark:text-[#0d0d0e] dark:hover:bg-white">Add to list</button>
        </form>
        {formError && <p className="mt-3 text-sm text-red-500">{formError}</p>}
      </section>
      <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
        {['Today', 'Upcoming', 'Past', 'Completed'].map((groupName, index) => (
          <section key={groupName} className={`min-h-[280px] border-t border-black/15 px-4 py-5 dark:border-white/10 ${index > 0 ? 'md:border-l md:border-black/10 dark:md:border-white/10' : ''}`}>
            <div className="mb-5 flex items-center justify-between"><h3 className="eyebrow">{groupName}</h3><span className="border border-black/10 px-2 py-1 text-[10px] tabular-nums text-zinc-500 dark:border-white/10">{groupedTasks[groupName].length}</span></div>
            <div className="divide-y divide-black/[0.08] dark:divide-white/[0.07]">
              {groupedTasks[groupName].length === 0 ? <p className="py-6 text-xs text-zinc-500">Nothing here yet.</p> : groupedTasks[groupName].map(task => (
                <div key={task._id} className="group flex items-start gap-3 py-4">
                  <button onClick={() => toggleComplete(task._id, task.completed)} aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'} className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${task.completed ? 'border-[#b9a47b] bg-[#b9a47b] text-[#0d0d0e]' : 'border-zinc-500 text-transparent hover:border-[#b9a47b]'}`}>
                    {task.completed && <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}
                  </button>
                  <div className="min-w-0 flex-1"><p className={`break-words text-sm leading-5 ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-800 dark:text-zinc-200'}`}>{task.title}</p>{task.dueDate && <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">{new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>}</div>
                  <button onClick={() => deleteTask(task._id)} aria-label="Delete task" className="text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">×</button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
