import { Link } from 'react-router-dom'

const features = [
  { number: '01', title: 'A considered task list', body: 'Keep personal work in view, with due dates and clear states that make the next action obvious.' },
  { number: '02', title: 'Work, together', body: 'Share responsibilities with your team and see what is moving without adding another layer of noise.' },
  { number: '03', title: 'Progress with context', body: 'Read your weekly rhythm through simple productivity measures and completion trends.' },
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f3ee] font-sans text-[#242320] transition-colors dark:bg-[#0d0d0e] dark:text-[#eeece6]">
      <section className="relative px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32">
        <div className="mx-auto grid max-w-7xl items-end gap-14 lg:grid-cols-[1.3fr_.7fr]">
          <div>
            <p className="eyebrow mb-7">A quieter way to get things done</p>
            <h1 className="editorial-display max-w-4xl text-[clamp(3.7rem,8vw,7.8rem)] leading-[.98] text-[#242320] dark:text-[#eeece6]">
              Make room for<br /><span className="text-[#a58c63]">meaningful work.</span>
            </h1>
          </div>
          <div className="max-w-md border-l border-black/15 pb-1 pl-7 dark:border-white/15 lg:mb-3">
            <p className="text-base leading-8 text-[#77746c] dark:text-zinc-400">
              Stillpoint brings your tasks, team commitments and progress into one deliberate workspace. Less visual noise. A clearer sense of what matters next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="editorial-button inline-flex items-center gap-4 bg-[#242320] px-6 py-4 text-[12px] font-semibold tracking-wide text-[#f5f3ee] hover:bg-black dark:bg-[#eeece6] dark:text-[#0d0d0e] dark:hover:bg-white">Open your workspace <span aria-hidden="true">↗</span></Link>
              <Link to="/login" className="editorial-button border border-black/15 px-6 py-4 text-[12px] font-semibold tracking-wide text-[#242320] hover:bg-black/[0.04] dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/[0.05]">Sign in</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-24 max-w-7xl border-t border-black/10 pt-5 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[.18em] text-[#8a867d]">
            <span>Personal focus</span><span>Team clarity</span><span>Measured progress</span><span>Built for everyday work</span>
          </div>
        </div>
      </section>
      <section className="border-y border-black/10 bg-[#eeece5] px-5 py-20 dark:border-white/[0.07] dark:bg-[#111113] sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid gap-5 md:grid-cols-[.7fr_1.3fr] md:items-end">
            <p className="eyebrow">The working principles</p>
            <h2 className="editorial-display max-w-3xl text-4xl leading-tight text-[#242320] dark:text-[#eeece6] sm:text-5xl">Structure for the work in front of you.</h2>
          </div>
          <div className="grid gap-0 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.number} className={`border-t border-black/15 py-7 dark:border-white/10 md:pr-9 ${index > 0 ? 'md:border-l md:pl-9' : ''}`}>
                <p className="eyebrow mb-10">{feature.number} / Principle</p>
                <h3 className="editorial-display mb-4 text-2xl text-[#242320] dark:text-[#eeece6]">{feature.title}</h3>
                <p className="max-w-xs text-sm leading-7 text-[#77746c] dark:text-zinc-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 border-b border-black/10 pb-10 dark:border-white/10 md:flex-row md:items-end">
          <div><p className="eyebrow mb-5">Begin with intention</p><h2 className="editorial-display max-w-2xl text-4xl leading-tight dark:text-[#eeece6] sm:text-5xl">Bring the important things into focus.</h2></div>
          <Link to="/register" className="editorial-button inline-flex w-fit items-center gap-5 bg-[#242320] px-6 py-4 text-xs font-semibold tracking-wide text-[#f5f3ee] hover:bg-black dark:bg-[#eeece6] dark:text-[#0d0d0e] dark:hover:bg-white">Create an account <span>↗</span></Link>
        </div>
        <footer className="mx-auto mt-6 flex max-w-7xl justify-between text-[10px] uppercase tracking-[.16em] text-[#8a867d]"><span>Stillpoint / Task workspace</span><span>Make the day count.</span></footer>
      </section>
    </div>
  )
}
