export default function StatCard({ title, value }) {
  return (
    <div className="relative flex min-h-[148px] flex-col justify-between border-t border-zinc-800/80 py-5 pr-4 dark:border-white/10">
      <div className="flex items-start justify-between">
        <p className="eyebrow">{title}</p>
        <span className="h-1.5 w-1.5 bg-[#b9a47b]" />
      </div>
      <p className="editorial-display text-5xl leading-none tracking-tight text-[#242320] dark:text-[#eeece6] sm:text-6xl">{value}</p>
    </div>
  )
}
