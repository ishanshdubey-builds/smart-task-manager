import { useState, useEffect } from 'react'
import API from '../api/api'

const groupTasks = (tasks) => {
  const groups = {
    'Today': [],
    'Upcoming': [],
    'Past': [],
    'Completed': []
  }
  
  // Get today's local date in YYYY-MM-DD format
  const todayLocal = new Date()
  const todayStr = todayLocal.toLocaleDateString('en-CA')

  tasks.forEach(task => {
    if (task.completed) {
      groups['Completed'].push(task)
      return
    }

    if (task.dueDate) {
      // Due date is stored as UTC midnight (e.g. 2023-10-15T00:00:00.000Z).
      // Taking just the substring gives us the exact date stored.
      const taskDateStr = task.dueDate.split('T')[0]
      
      if (taskDateStr === todayStr) {
        groups['Today'].push(task)
      } else if (taskDateStr < todayStr) {
        groups['Past'].push(task)
      } else {
        groups['Upcoming'].push(task)
      }
    } else {
      groups['Today'].push(task)
    }
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

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const res = await API.get('/api/tasks')
      // Only personal tasks
      const myId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id
      setTasks(res.data.filter(t => t.userId === myId && t.type === 'personal'))
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    if (newTask.dueDate < todayStr) {
      setFormError('Cannot assign tasks to past dates')
      return
    }

    setCreating(true)
    try {
      const payload = {
        title: newTask.title,
        type: 'personal',
        dueDate: newTask.dueDate || todayStr
      }
      const res = await API.post('/api/tasks', payload)
      setTasks([res.data, ...tasks])
      setNewTask({ title: '', dueDate: todayStr })
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      const res = await API.put(`/api/tasks/${taskId}`, { completed: !currentStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/api/tasks/${taskId}`)
      setTasks(tasks.filter(t => t._id !== taskId))
    } catch (err) {
      console.error(err)
    }
  }

  const groupedTasks = groupTasks(tasks)

  if (loading) return <div className="p-8 text-center text-gray-500">Loading tasks...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
      </div>

      <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center px-4 focus-within:ring-2 focus-within:ring-purple-500 transition-all">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full p-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 outline-none"
              required
            />
          </div>
          <input 
            type="date"
            min={todayStr}
            value={newTask.dueDate}
            onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
            className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none"
          />
          <button
            type="submit"
            disabled={creating || !newTask.title.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-70"
          >
            Add Task
          </button>
        </form>
        {formError && <p className="text-red-500 text-sm mt-2 ml-1">{formError}</p>}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Today', 'Upcoming', 'Past', 'Completed'].map(groupName => (
          <div key={groupName} className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 border border-gray-200 dark:border-white/5 h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              {groupName}
              <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{groupedTasks[groupName].length}</span>
            </h3>
            
            <div className="space-y-3">
              {groupedTasks[groupName].length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No tasks here</div>
              ) : (
                groupedTasks[groupName].map(task => (
                  <div key={task._id} className="group relative overflow-hidden z-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-2xl hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => toggleComplete(task._id, task.completed)}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 hover:border-green-500'
                        }`}
                      >
                        {task.completed && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium break-words ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => deleteTask(task._id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
