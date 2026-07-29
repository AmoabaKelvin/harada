import { useSyncExternalStore } from 'react'

export type Action = {
  text: string
  done: boolean
  completedAt: number | null
}

export type Area = {
  title: string
  actions: Array<Action>
}

export type Plan = {
  ambition: string
  areas: Array<Area>
}

const STORAGE_KEY = 'harada-plan'

function emptyPlan(): Plan {
  return {
    ambition: '',
    areas: Array.from({ length: 8 }, () => ({
      title: '',
      actions: Array.from({ length: 8 }, () => ({
        text: '',
        done: false,
        completedAt: null,
      })),
    })),
  }
}

function load(): Plan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Plan
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

export function toggleAction(areaIndex: number, actionIndex: number) {
  commit({
    ...plan,
    areas: plan.areas.map((area, i) =>
      i === areaIndex
        ? {
            ...area,
            actions: area.actions.map((action, j) =>
              j === actionIndex
                ? {
                    ...action,
                    done: !action.done,
                    completedAt: action.done ? null : Date.now(),
                  }
                : action,
            ),
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
