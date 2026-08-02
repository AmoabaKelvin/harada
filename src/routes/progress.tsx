import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckIcon } from '@heroicons/react/16/solid'
import { planStats, routineStats, toggleAction, usePlan } from '../lib/plan'

export const Route = createFileRoute('/progress')({ component: ProgressPage })

function ProgressPage() {
  const plan = usePlan()

  if (!plan.ambition) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nothing to track yet
        </h1>
        <p className="mt-3 text-base text-pretty text-neutral-600">
          Set your ambition and plan a few actions first.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Start your chart
        </Link>
      </div>
    )
  }

  const { planned, done } = planStats(plan)
  const percent = planned === 0 ? 0 : Math.round((done / planned) * 100)

  const routines = routineStats(plan)
  const todayRoutines = plan.areas.flatMap((area, areaIndex) =>
    area.actions
      .map((action, actionIndex) => ({ action, areaIndex, actionIndex }))
      .filter(
        ({ action }) => action.kind === 'routine' && action.text.trim(),
      )
      .map((item) => ({
        ...item,
        goalTitle: area.title || `Goal ${areaIndex + 1}`,
      })),
  )

  const completed = plan.areas
    .flatMap((area, areaIndex) =>
      area.actions
        .filter((action) => action.done && action.completedAt !== null)
        .map((action) => ({
          text: action.text,
          completedAt: action.completedAt!,
          goalTitle: area.title || `Goal ${areaIndex + 1}`,
        })),
    )
    .sort((a, b) => b.completedAt - a.completedAt)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
      <p className="mt-1 max-w-[60ch] text-sm text-neutral-500">
        {plan.ambition}
      </p>

      <div className="mt-8 grid grid-cols-3">
        <div className="pr-4">
          <p className="truncate text-sm text-neutral-500">Planned</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {planned}
            <span className="text-sm font-normal text-neutral-400"> /64</span>
          </p>
        </div>
        <div className="border-l border-neutral-950/10 px-4">
          <p className="truncate text-sm text-neutral-500">Done</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{done}</p>
        </div>
        <div className="border-l border-neutral-950/10 pl-4">
          <p className="truncate text-sm text-neutral-500">Complete</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{percent}%</p>
        </div>
      </div>

      <div className="mt-12 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">Routine check</h2>
        {routines.routines > 0 && (
          <p className="text-sm text-neutral-500 tabular-nums">
            {routines.doneToday} of {routines.routines} today
          </p>
        )}
      </div>
      {routines.routines === 0 ? (
        <p className="mt-3 text-sm text-pretty text-neutral-500">
          No routines yet. On a goal page, mark a recurring action as a routine
          — it resets each morning, and your daily success rate shows up here.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3">
            <div className="pr-4">
              <p className="truncate text-sm text-neutral-500">Today</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {Math.round((routines.todayRate ?? 0) * 100)}%
              </p>
            </div>
            {routines.windows.map((window) => (
              <div
                key={window.days}
                className="border-l border-neutral-950/10 px-4 last:pl-4 last:pr-0"
              >
                <p className="truncate text-sm text-neutral-500">
                  {window.days}-day
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {window.rate === null ? '—' : `${Math.round(window.rate * 100)}%`}
                </p>
                {window.daysCounted < window.days && (
                  <p className="mt-0.5 truncate text-xs text-neutral-400 tabular-nums">
                    {window.daysCounted}{' '}
                    {window.daysCounted === 1 ? 'day' : 'days'} tracked
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-pretty text-neutral-500">
            The aim is consistency, not perfection — keep the 30- and 60-day
            rates at 90% or better.
          </p>
          <ul role="list" className="mt-4 divide-y divide-neutral-950/5">
            {todayRoutines.map(({ action, areaIndex, actionIndex, goalTitle }) => (
              <li
                key={`${areaIndex}-${actionIndex}`}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  aria-label={`Mark “${action.text}” done today`}
                  checked={action.done}
                  onChange={() => toggleAction(areaIndex, actionIndex)}
                  className="size-4 shrink-0 accent-blue-600"
                />
                <p className={action.done ? 'text-neutral-400 line-through' : ''}>
                  {action.text}
                </p>
                <p className="ml-auto shrink-0 text-xs text-neutral-500">
                  {goalTitle}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-12 text-base font-semibold">By goal</h2>
      <div className="mt-4 flex flex-col gap-5">
        {plan.areas.map((area, areaIndex) => {
          const doneCount = area.actions.filter((action) => action.done).length
          return (
            <div key={areaIndex}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <p
                  className={`truncate font-medium ${area.title ? '' : 'text-neutral-400'}`}
                >
                  {area.title || `Goal ${areaIndex + 1}`}
                </p>
                <p className="shrink-0 text-neutral-500 tabular-nums">
                  {doneCount}/8
                </p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-neutral-950/5">
                <div
                  className="h-full w-(--bar) rounded-full bg-blue-600"
                  style={{ '--bar': `${(doneCount / 8) * 100}%` } as React.CSSProperties}
                />
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="mt-12 text-base font-semibold">Things you’ve done</h2>
      {completed.length === 0 ? (
        <p className="mt-3 text-sm text-pretty text-neutral-500">
          Nothing checked off yet. Open a goal on the chart and mark your first
          action done.
        </p>
      ) : (
        <ul role="list" className="mt-2 divide-y divide-neutral-950/5">
          {completed.map((item) => (
            <li
              key={`${item.completedAt}-${item.text}`}
              className="flex items-start justify-between gap-4 py-3 text-sm"
            >
              <div className="flex items-start gap-2.5">
                <CheckIcon className="size-4 h-lh shrink-0 fill-blue-600" />
                <div>
                  <p>{item.text}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {item.goalTitle}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-neutral-500 tabular-nums">
                {new Date(item.completedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
