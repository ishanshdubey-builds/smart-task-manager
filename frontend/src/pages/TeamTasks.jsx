import { useState, useEffect } from 'react'
import API from '../api/api'

export default function TeamTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('assigned') // 'assigned' or 'created'

  const myId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id

  useEffect(() => {
    API.get('/api/tasks')
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
      const res = await API.put(`/api/tasks/${taskId}`, { completed: !currentStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading team tasks...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Tasks</h2>
      </div>

      <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        
        {/* TABS */}
        <div className="flex border-b border-gray-200 dark:border-white/10">
          <button 
            onClick={() => setTab('assigned')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              tab === 'assigned' 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Assigned To Me
            <span className="ml-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{assignedTasks.length}</span>
          </button>
          <button 
            onClick={() => setTab('created')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              tab === 'created' 
                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-500' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Created By Me
            <span className="ml-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{createdTasks.length}</span>
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
                <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                     <button 
                        onClick={() => toggleComplete(task._id, task.completed)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 hover:border-green-500'
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
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    task.completed ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
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
