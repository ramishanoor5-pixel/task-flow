import { useState, useEffect, useMemo } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StatsOverview from '../components/StatsOverview'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  FolderOpen,
  Loader2,
} from 'lucide-react'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { showToast } = useToast()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Read: Real-time listener strictly scoped to currentUser.uid
  useEffect(() => {
    if (!currentUser?.uid || !db) {
      setLoading(false)
      return
    }

    setLoading(true)
    const tasksRef = collection(db, 'tasks')
    
    // Strict user-specific query
    const q = query(tasksRef, where('userId', '==', currentUser.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        setTasks(items)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore snapshot listener error:', err)
        showToast('Firestore sync error: ' + err.message, 'error')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser?.uid, showToast])

  // Helper to safely extract milliseconds for sorting
  const getTimestamp = (val) => {
    if (!val) return 0
    if (typeof val.toMillis === 'function') return val.toMillis()
    if (typeof val.toDate === 'function') return val.toDate().getTime()
    return new Date(val).getTime() || 0
  }

  // Create: Add new item to Cloud Firestore
  const handleCreateTask = async (formData) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      showToast('Item created successfully!')
    } catch (err) {
      console.error('Firestore create error:', err)
      showToast('Failed to create item: ' + err.message, 'error')
      throw err
    }
  }

  // Update: Edit existing item in Cloud Firestore
  const handleUpdateTask = async (formData) => {
    if (!taskToEdit) return

    try {
      const taskRef = doc(db, 'tasks', taskToEdit.id)
      await updateDoc(taskRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      })
      showToast('Item updated successfully!')
    } catch (err) {
      console.error('Firestore update error:', err)
      showToast('Failed to update item: ' + err.message, 'error')
      throw err
    }
  }

  // Quick toggle task status directly from card
  const handleStatusToggle = async (task) => {
    const nextStatus =
      task.status === 'Pending'
        ? 'In Progress'
        : task.status === 'In Progress'
        ? 'Completed'
        : 'Pending'

    try {
      const taskRef = doc(db, 'tasks', task.id)
      await updateDoc(taskRef, {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      })
      showToast(`Status updated to "${nextStatus}"`, 'info')
    } catch (err) {
      console.error('Firestore status toggle error:', err)
      showToast('Failed to change status: ' + err.message, 'error')
    }
  }

  // Delete: Remove item from Cloud Firestore
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return

    try {
      setIsDeleting(true)
      await deleteDoc(doc(db, 'tasks', taskToDelete.id))
      showToast('Item deleted successfully', 'info')
      setTaskToDelete(null)
    } catch (err) {
      console.error('Firestore delete error:', err)
      showToast('Error deleting item: ' + err.message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtered & Sorted items
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory =
          selectedCategory === 'All' || task.category === selectedCategory

        const matchesStatus =
          selectedStatus === 'All' || task.status === selectedStatus

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weight = { High: 3, Medium: 2, Low: 1 }
          return (weight[b.priority] || 0) - (weight[a.priority] || 0)
        }
        if (sortBy === 'oldest') {
          return getTimestamp(a.createdAt) - getTimestamp(b.createdAt)
        }
        // Default newest first
        return getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      })
  }, [tasks, searchTerm, selectedCategory, selectedStatus, sortBy])

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {currentUser?.displayName || 'User'}
              </h1>
              <span className="text-xl">👋</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Here is your personal workspace. All data is securely isolated to your account.
            </p>
          </div>

          {/* New Item Button */}
          <button
            onClick={() => {
              setTaskToEdit(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-150 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Item</span>
          </button>
        </div>

        {/* Live Overview Statistics */}
        <StatsOverview tasks={tasks} />

        {/* Search, Filter, and Controls Bar */}
        <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Categories</option>
                <option value="Work" className="bg-slate-900">Work</option>
                <option value="Personal" className="bg-slate-900">Personal</option>
                <option value="Study" className="bg-slate-900">Study</option>
                <option value="Urgent" className="bg-slate-900">Urgent</option>
                <option value="General" className="bg-slate-900">General</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Statuses</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
                <option value="In Progress" className="bg-slate-900">In Progress</option>
                <option value="Completed" className="bg-slate-900">Completed</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-slate-900">Newest First</option>
                <option value="oldest" className="bg-slate-900">Oldest First</option>
                <option value="priority" className="bg-slate-900">Highest Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Grid & States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs font-medium">Loading your collection from Cloud Firestore...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 p-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No items in your workspace</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'No items matched your search criteria. Try resetting filters.'
                : 'Your collection is currently empty. Create your first item to get started!'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('All')
                setSelectedStatus('All')
                setTaskToEdit(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setTaskToEdit(t)
                  setIsModalOpen(true)
                }}
                onDelete={(t) => setTaskToDelete(t)}
                onStatusToggle={handleStatusToggle}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTaskToEdit(null)
        }}
        onSave={taskToEdit ? handleUpdateTask : handleCreateTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
        deleting={isDeleting}
      />
    </div>
  )
}
