import { Link, createFileRoute } from '@tanstack/react-router'
import { planStats, usePlan } from '../lib/plan'
import type { Area, Plan } from '../lib/plan'

export const Route = createFileRoute('/overview')({ component: OverviewPage })

// Ring order shared with the chart page: positions around a center cell.
const RING = [0, 1, 2, 3, -1, 4, 5, 6, 7]

function OverviewPage() {
  const plan = usePlan()

  if (!plan.ambition) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nothing to see yet
        </h1>
        <p className="mt-3 text-base text-pretty text-neutral-600">
          Set your ambition and the full 64-cell chart will build itself here.
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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight">Open Window 64</h1>
      <p className="mt-1 max-w-[80ch] text-sm text-neutral-500 tabular-nums">
        {plan.ambition} · {planned} of 64 actions planned · {done} done
      </p>

      <div className="mt-8 overflow-x-auto">
        <div className="grid min-w-[44rem] grid-cols-3 gap-(--padding) rounded-(--radius) bg-neutral-50 p-(--padding) [--padding:--spacing(1.5)] [--radius:var(--radius-2xl)]">
          {RING.map((blockIndex) =>
            blockIndex === -1 ? (
              <CenterBlock key="center" plan={plan} />
            ) : (
              <GoalBlock
                key={blockIndex}
                areaIndex={blockIndex}
                area={plan.areas[blockIndex]}
              />
            ),
          )}
        </div>
      </div>

      <p className="mt-6 max-w-[80ch] text-sm text-pretty text-neutral-500">
        Your ambition sits at the center, fed by eight goals. Each outer block
        expands one goal into its eight daily actions — done actions are
        crossed out. Click any shaded goal cell to edit it.
      </p>
    </div>
  )
}

const CELL =
  'flex aspect-square items-center justify-center p-1 text-center text-[0.625rem]/3 sm:p-1.5 sm:text-xs/4'

function CenterBlock({ plan }: { plan: Plan }) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[calc(var(--radius)-var(--padding))] bg-neutral-950/10 ring-1 ring-neutral-950/10">
      {RING.map((areaIndex) =>
        areaIndex === -1 ? (
          <div
            key="ambition"
            className={`${CELL} bg-neutral-900 font-medium text-white`}
          >
            <span className="line-clamp-5">{plan.ambition}</span>
          </div>
        ) : (
          <GoalTitleCell
            key={areaIndex}
            areaIndex={areaIndex}
            title={plan.areas[areaIndex].title}
          />
        ),
      )}
    </div>
  )
}

function GoalBlock({ areaIndex, area }: { areaIndex: number; area: Area }) {
  let actionCursor = 0
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[calc(var(--radius)-var(--padding))] bg-neutral-950/10 ring-1 ring-neutral-950/10">
      {RING.map((position) => {
        if (position === -1) {
          return (
            <GoalTitleCell
              key="title"
              areaIndex={areaIndex}
              title={area.title}
            />
          )
        }
        const action = area.actions[actionCursor]
        actionCursor += 1
        return (
          <div
            key={position}
            className={`${CELL} ${
              action.done
                ? 'bg-blue-50 text-neutral-400 line-through'
                : 'bg-white'
            }`}
          >
            <span className="line-clamp-5">{action.text}</span>
          </div>
        )
      })}
    </div>
  )
}

function GoalTitleCell({
  areaIndex,
  title,
}: {
  areaIndex: number
  title: string
}) {
  return (
    <Link
      to="/goal/$goalId"
      params={{ goalId: String(areaIndex + 1) }}
      className={`${CELL} bg-neutral-100 hover:bg-neutral-200/70 focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-600 ${
        title ? 'font-medium' : 'text-neutral-400'
      }`}
    >
      <span className="line-clamp-5">{title || `Goal ${areaIndex + 1}`}</span>
    </Link>
  )
}
