import { useState, useEffect } from 'react'
import API from '../api/api'

export default function TeamTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('assigned') // 'assigned' or 'created'

  const myId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id

  useEffect(() => {
    API.get('tasks')
      .then(res => {
        // Filter out purely personal tasks not involving other users.
        // Wait, the API returns tasks where userId = me OR assignedTo = me.
        // We just filter on frontend.
        setTasks(res.data.filter(t => t.type === 'team'))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const assignedTasks = tasks.filter(t => t.assignedTo && (t.assignedTo._id === myId || t.assignedTo === myId))
  const createdTasks = tasks.filter(t => t.userId === myId)

  const activeTasks = tab === 'assigned' ? assignedTasks : createdTasks

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      const res = await API.put(`tasks/${taskId}`, { completed: !currentStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading team tasks...</div>

  return (
    <div className="space-y-10"><div><p className="eyebrow mb-3">Shared commitments / collaboration</p><h2 className="editorial-display text-4xl text-zinc-900 dark:text-[#eeece6] sm:text-5xl">Team tasks</h2></div>
      <div className="flex items-center justify-between">
        
      </div>

      <div className="bg-transparent border-y border-black/10 dark:border-white/10 overflow-hidden shadow-sm">
        
        {/* TABS */}
        <div className="flex border-b border-gray-200 dark:border-white/10">
          <button 
            onClick={() => setTab('assigned')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              tab === 'assigned' 
                ? 'bg-[#b9a47b]/10 text-[#9d855c] dark:text-[#c9b58e] border-b-2 border-[#b9a47b]' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Assigned To Me
            <span className="ml-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-sm text-xs">{assignedTasks.length}</span>
          </button>
          <button 
            onClick={() => setTab('created')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              tab === 'created' 
                ? 'bg-[#b9a47b]/10 text-[#9d855c] dark:text-[#c9b58e] border-b-2 border-[#b9a47b]' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Created By Me
            <span className="ml-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-sm text-xs">{createdTasks.length}</span>
          </button>
        </div>

        {/* LIST */}
        <div className="p-6">
          {activeTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No tasks found in this tab.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTasks.map(task => (
                <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                     <button 
                        onClick={() => toggleComplete(task._id, task.completed)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          task.completed ? 'bg-[#b9a47b] border-[#b9a47b] text-[#111]' : 'border-gray-400 hover:border-green-500'
                        }`}
                      >
                        {task.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </button>
                      <div>
                        <h4 className={`font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{task.title}</h4>
                        {tab === 'assigned' ? (
                          <p className="text-xs text-gray-500 mt-1">Created by Team Member</p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned to: <span className="font-medium text-gray-700 dark:text-gray-300">{task.assignedTo?.email || task.assignedTo}</span>
                          </p>
                        )}
                      </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-sm ${
                    task.completed ? 'bg-white/[0.04] text-zinc-500 dark:text-zinc-300' : 'bg-[#b9a47b]/10 text-[#9d855c] dark:text-[#c9b58e]'
                  }`}>
                    {task.completed ? 'Done' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
