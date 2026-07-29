import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import {
  setActionText,
  setAreaTitle,
  toggleAction,
  usePlan,
} from '../lib/plan'

export const Route = createFileRoute('/goal/$goalId')({
  beforeLoad: ({ params }) => {
    const id = Number(params.goalId)
    if (!Number.isInteger(id) || id < 1 || id > 8) {
      throw redirect({ to: '/' })
    }
  },
  component: GoalPage,
})

function GoalPage() {
  const { goalId } = Route.useParams()
  const plan = usePlan()
  const areaIndex = Number(goalId) - 1
  const area = plan.areas[areaIndex]
  const doneCount = area.actions.filter((action) => action.done).length

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-950"
      >
        <ChevronLeftIcon className="size-4 shrink-0 fill-neutral-400" />
        Back to chart
      </Link>

      <p className="mt-8 text-sm font-medium text-blue-600 tabular-nums">
        Goal {areaIndex + 1} of 8
      </p>
      <div className="mt-2">
        <label htmlFor="goal-title" className="sr-only">
          Supporting goal
        </label>
        <input
          type="text"
          id="goal-title"
          name="goal-title"
          value={area.title}
          onChange={(event) => setAreaTitle(areaIndex, event.target.value)}
          placeholder="e.g. Physical conditioning"
          className="block w-full rounded-lg bg-white px-3 py-2 text-lg font-medium ring-1 ring-neutral-950/10 placeholder:font-normal placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600"
        />
      </div>
      <p className="mt-2 text-sm text-pretty text-neutral-500">
        One of the eight goals that feed your ambition this year.
      </p>

      <div className="mt-10 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">Daily actions</h2>
        <p className="text-sm text-neutral-500 tabular-nums">
          {doneCount} of 8 done
        </p>
      </div>
      <p className="mt-1 text-sm text-pretty text-neutral-500">
        Eight small, concrete things you can act on. Check them off as you do
        them.
      </p>

      <ul role="list" className="mt-4 divide-y divide-neutral-950/5">
        {area.actions.map((action, actionIndex) => (
          <li key={actionIndex} className="flex items-center gap-3 py-1.5">
            <span className="group inline-grid size-5 grid-cols-1 sm:size-4">
              <input
                type="checkbox"
                name={`action-${areaIndex + 1}-${actionIndex + 1}-done`}
                aria-label={
                  action.text.trim()
                    ? `Mark “${action.text}” done`
                    : `Mark action ${actionIndex + 1} done`
                }
                checked={action.done}
                disabled={!action.text.trim()}
                onChange={() => toggleAction(areaIndex, actionIndex)}
                className="col-start-1 row-start-1 appearance-none rounded-sm border border-neutral-300 bg-white checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-neutral-300 disabled:bg-neutral-100 disabled:checked:bg-neutral-100 forced-colors:appearance-auto"
              />
              <svg
                viewBox="0 0 14 14"
                fill="none"
                className="pointer-events-none col-start-1 row-start-1 size-7/8 self-center justify-self-center stroke-white group-has-disabled:stroke-neutral-950/25"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-not-has-checked:opacity-0"
                />
                <path
                  d="M3 7H11"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-not-has-indeterminate:opacity-0"
                />
              </svg>
            </span>
            <input
              type="text"
              name={`action-${areaIndex + 1}-${actionIndex + 1}`}
              aria-label={`Action ${actionIndex + 1}`}
              value={action.text}
              onChange={(event) =>
                setActionText(areaIndex, actionIndex, event.target.value)
              }
              placeholder={ACTION_HINTS[actionIndex]}
              className={`w-full rounded-md px-2 py-2 text-sm placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600 max-sm:text-base ${
                action.done ? 'text-neutral-400 line-through' : ''
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

const ACTION_HINTS = [
  'e.g. Stretch every morning',
  'e.g. Pick up the trash',
  'e.g. Read 20 minutes',
  'e.g. Clean your room',
  'e.g. Greet people first',
  'e.g. Write down one win',
  'e.g. Sleep 8 hours',
  'e.g. Be a person people root for',
]
