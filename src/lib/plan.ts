import { useSyncExternalStore } from 'react'

export type ActionKind = 'once' | 'routine'

export type Action = {
  text: string
  kind: ActionKind
  done: boolean
  completedAt: number | null
  // Local YYYY-MM-DD days a routine was completed; unused for one-time actions.
  completedDates: string[]
}

export type Area = {
  title: string
  actions: Array<Action>
}

export type Plan = {
  ambition: string
  // Local YYYY-MM-DD the routine check started; caps the success-rate window.
  trackingSince: string
  areas: Array<Area>
}

const STORAGE_KEY = 'harada-plan'

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function emptyPlan(): Plan {
  return {
    ambition: '',
    trackingSince: todayKey(),
    areas: Array.from({ length: 8 }, () => ({
      title: '',
      actions: Array.from({ length: 8 }, () => ({
        text: '',
        kind: 'once',
        done: false,
        completedAt: null,
        completedDates: [],
      })),
    })),
  }
}

type StoredPlan = {
  ambition?: string
  trackingSince?: string
  areas?: Array<{ title?: string; actions?: Array<Partial<Action>> }>
}

// Fills fields older stored plans lack, and derives a routine's `done`
// from whether it was completed today — this is what resets routines daily.
function migrate(stored: StoredPlan): Plan {
  const empty = emptyPlan()
  const today = todayKey()
  return {
    ambition: stored.ambition ?? '',
    trackingSince: stored.trackingSince ?? today,
    areas: empty.areas.map((emptyArea, i) => {
      const area = stored.areas?.[i]
      return {
        title: area?.title ?? '',
        actions: emptyArea.actions.map((emptyAction, j) => {
          const action = area?.actions?.[j]
          if (!action) return emptyAction
          const kind: ActionKind = action.kind === 'routine' ? 'routine' : 'once'
          const completedDates = action.completedDates ?? []
          return {
            text: action.text ?? '',
            kind,
            done:
              kind === 'routine'
                ? completedDates.includes(today)
                : Boolean(action.done),
            completedAt: action.completedAt ?? null,
            completedDates,
          }
        }),
      }
    }),
  }
}

function load(): Plan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return migrate(JSON.parse(raw) as StoredPlan)
  } catch {
    // corrupted storage — start fresh
  }
  return emptyPlan()
}

let plan: Plan = load()
const listeners = new Set<() => void>()

function commit(next: Plan) {
  plan = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePlan(): Plan {
  return useSyncExternalStore(subscribe, () => plan)
}

export function setAmbition(ambition: string) {
  commit({ ...plan, ambition })
}

export function setAreaTitle(areaIndex: number, title: string) {
  commit({
    ...plan,
    areas: plan.areas.map((area, i) =>
      i === areaIndex ? { ...area, title } : area,
    ),
  })
}

export function setActionText(areaIndex: number, actionIndex: number, text: string) {
  commit({
    ...plan,
    areas: plan.areas.map((area, i) =>
      i === areaIndex
        ? {
            ...area,
            actions: area.actions.map((action, j) =>
              j === actionIndex ? { ...action, text } : action,
            ),
          }
        : area,
    ),
  })
}

export function setActionKind(
  areaIndex: number,
  actionIndex: number,
  kind: ActionKind,
) {
  const today = todayKey()
  commit({
    ...plan,
    areas: plan.areas.map((area, i) =>
      i === areaIndex
        ? {
            ...area,
            actions: area.actions.map((action, j) =>
              j === actionIndex && action.kind !== kind
                ? {
                    ...action,
                    kind,
                    done:
                      kind === 'routine'
                        ? action.completedDates.includes(today)
                        : action.completedAt !== null,
                  }
                : action,
            ),
          }
        : area,
    ),
  })
}

export function toggleAction(areaIndex: number, actionIndex: number) {
  const today = todayKey()
  commit({
    ...plan,
    areas: plan.areas.map((area, i) =>
      i === areaIndex
        ? {
            ...area,
            actions: area.actions.map((action, j) => {
              if (j !== actionIndex) return action
              if (action.kind === 'routine') {
                const doneToday = action.completedDates.includes(today)
                return {
                  ...action,
                  done: !doneToday,
                  completedAt: doneToday ? null : Date.now(),
                  completedDates: doneToday
                    ? action.completedDates.filter((d) => d !== today)
                    : [...action.completedDates, today],
                }
              }
              return {
                ...action,
                done: !action.done,
                completedAt: action.done ? null : Date.now(),
              }
            }),
          }
        : area,
    ),
  })
}

export function planStats(current: Plan) {
  let planned = 0
  let done = 0
  for (const area of current.areas) {
    for (const action of area.actions) {
      if (action.text.trim()) planned += 1
      if (action.done) done += 1
    }
  }
  return { planned, done }
}

export type RoutineWindow = {
  days: number
  daysCounted: number
  rate: number | null
}

export type RoutineStats = {
  routines: number
  doneToday: number
  todayRate: number | null
  windows: Array<RoutineWindow>
}

// Success rate = completions / (routines × days), per rolling window,
// clipped at trackingSince so days before the check existed don't count.
export function routineStats(current: Plan): RoutineStats {
  const routines = current.areas.flatMap((area) =>
    area.actions.filter(
      (action) => action.kind === 'routine' && action.text.trim(),
    ),
  )
  const today = todayKey()
  const doneToday = routines.filter((action) =>
    action.completedDates.includes(today),
  ).length

  const windows = [30, 60].map((days) => {
    let daysCounted = 0
    let completions = 0
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = todayKey(date)
      if (key < current.trackingSince) break
      daysCounted += 1
      for (const action of routines) {
        if (action.completedDates.includes(key)) completions += 1
      }
    }
    const expected = routines.length * daysCounted
    return { days, daysCounted, rate: expected === 0 ? null : completions / expected }
  })

  return {
    routines: routines.length,
    doneToday,
    todayRate: routines.length === 0 ? null : doneToday / routines.length,
    windows,
  }
}
