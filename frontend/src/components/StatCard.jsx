export default function StatCard({ title, value, icon, colorClass, shadowClass }) {
  return (
    <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all hover:bg-white/10 ${shadowClass}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{value}</h4>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  )
}
