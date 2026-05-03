export default function ThemeToggle() {
  const toggle = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <button 
      onClick={toggle}
      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
    >
      🌙
    </button>
  )
}