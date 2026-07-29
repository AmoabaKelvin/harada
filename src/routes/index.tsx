import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from '@heroicons/react/16/solid'
import { planStats, setAmbition, usePlan } from '../lib/plan'
import type { Area } from '../lib/plan'

export const Route = createFileRoute('/')({ component: Home })

// Grid order around the center cell: areas 0–3 above/beside, 4–7 below/beside.
const CELL_ORDER = [0, 1, 2, 3, -1, 4, 5, 6, 7]

function Home() {
  const plan = usePlan()

  if (!plan.ambition) return <Setup />

  const { planned, done } = planStats(plan)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-medium text-blue-600">Multiyear ambition</p>
      <AmbitionHeading ambition={plan.ambition} />
      <p className="mt-2 text-sm text-neutral-500 tabular-nums">
        {planned} of 64 actions planned · {done} done
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        {CELL_ORDER.map((areaIndex) =>
          areaIndex === -1 ? (
            <div
              key="center"
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-neutral-900 p-3 text-center sm:p-4"
            >
              <p className="text-xs font-medium text-neutral-400">Ambition</p>
              <p className="line-clamp-4 text-sm font-medium text-white">
                {plan.ambition}
              </p>
            </div>
          ) : (
            <GoalCell
              key={areaIndex}
              areaIndex={areaIndex}
              area={plan.areas[areaIndex]}
            />
          ),
        )}
      </div>

      <p className="mt-6 text-sm text-pretty text-neutral-500">
        Eight goals feed the ambition; each goal breaks into eight daily
        actions. Open a goal to plan it, then check actions off as you do them.
      </p>
    </div>
  )
}

function GoalCell({ areaIndex, area }: { areaIndex: number; area: Area }) {
  const doneCount = area.actions.filter((action) => action.done).length

  return (
    <Link
      to="/goal/$goalId"
      params={{ goalId: String(areaIndex + 1) }}
      className={`flex aspect-square flex-col justify-between rounded-xl border p-3 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-4 ${
        area.title
          ? 'border-neutral-950/10'
          : 'border-dashed border-neutral-950/15'
      }`}
    >
      <div>
        <p className="text-xs font-medium text-neutral-400 tabular-nums">
          {areaIndex + 1}
        </p>
        {area.title ? (
          <p className="mt-1 line-clamp-3 text-sm font-medium">{area.title}</p>
        ) : (
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-400">
            <PlusIcon className="size-4 shrink-0 fill-neutral-400" />
            Add goal
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-0.5 sm:gap-1">
          {area.actions.map((action, j) => (
            <span
              key={j}
              className={`size-1 rounded-full sm:size-1.5 ${
                action.done
                  ? 'bg-blue-600'
                  : action.text
                    ? 'bg-neutral-300'
                    : 'bg-neutral-100'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-400 tabular-nums">{doneCount}/8</p>
      </div>
    </Link>
  )
}

function AmbitionHeading({ ambition }: { ambition: string }) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <div className="mt-1 flex items-start justify-between gap-4">
        <h1 className="max-w-[30ch] text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {ambition}
        </h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md px-2 py-1 text-sm font-medium text-neutral-600 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <form
      className="mt-2 flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('ambition')
        if (typeof value === 'string' && value.trim()) {
          setAmbition(value.trim())
        }
        setEditing(false)
      }}
    >
      <input
        type="text"
        name="ambition"
        defaultValue={ambition}
        aria-label="Multiyear ambition"
        autoFocus
        className="block w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-neutral-950/10 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600 max-sm:text-base"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-lg px-2 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Cancel
      </button>
    </form>
  )
}

function Setup() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-medium text-blue-600">The Harada Method</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
        Dare to dream
      </h1>
      <p className="mt-3 text-base text-pretty text-neutral-600">
        Name a multiyear ambition, break it into eight goals and 64 daily
        actions — the same one-page chart Shohei Ohtani drew in high school.
      </p>
      <form
        className="mx-auto mt-8 flex max-w-xs flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const value = new FormData(event.currentTarget).get('ambition')
          if (typeof value === 'string' && value.trim()) {
            setAmbition(value.trim())
          }
        }}
      >
        <label htmlFor="ambition" className="sr-only">
          Multiyear ambition
        </label>
        <input
          type="text"
          id="ambition"
          name="ambition"
          required
          placeholder="e.g. Become a No. 1 draft pick"
          className="block w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-neutral-950/10 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600 max-sm:text-base"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Start planning
        </button>
      </form>
      <p className="mx-auto mt-6 max-w-xs text-sm text-pretty text-neutral-500">
        Stored on this device only. You can refine everything later.
      </p>
    </div>
  )
}
