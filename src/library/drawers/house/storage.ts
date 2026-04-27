/**
 * House drawer storage. Module-internal.
 *
 * v1 backs onto localStorage with a `library_house_` key prefix. The
 * interface is the seam: a Supabase-backed implementation can swap in
 * later without touching the components.
 */

import type { HouseTask, TaskStatus } from './types'

export interface HouseStorage {
  saveTask(task: HouseTask): Promise<HouseTask>
  getTask(id: string): Promise<HouseTask | null>
  listTasks(status?: TaskStatus): Promise<HouseTask[]>
  deleteTask(id: string): Promise<void>
  clearAll(): Promise<void>
}

const PREFIX    = 'library_house_'
const KEY_TASK  = (id: string) => `${PREFIX}task_${id}`
const KEY_INDEX = `${PREFIX}index`

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch { return null }
}
function writeJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}
function removeKey(key: string): void {
  try { localStorage.removeItem(key) } catch { /* noop */ }
}

class MockHouseStorage implements HouseStorage {
  async saveTask(task: HouseTask) {
    writeJSON(KEY_TASK(task.id), task)
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    if (!idx.includes(task.id)) {
      idx.push(task.id)
      writeJSON(KEY_INDEX, idx)
    }
    return task
  }
  async getTask(id: string) { return readJSON<HouseTask>(KEY_TASK(id)) }
  async listTasks(status?: TaskStatus) {
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    const out: HouseTask[] = []
    for (const id of idx) {
      const t = readJSON<HouseTask>(KEY_TASK(id))
      if (!t) continue
      if (status && t.status !== status) continue
      out.push(t)
    }
    return out
  }
  async deleteTask(id: string) {
    removeKey(KEY_TASK(id))
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    writeJSON(KEY_INDEX, idx.filter(x => x !== id))
  }
  async clearAll() {
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    for (const id of idx) removeKey(KEY_TASK(id))
    removeKey(KEY_INDEX)
  }
}

let instance: HouseStorage | null = null
export function getHouseStorage(): HouseStorage {
  if (!instance) instance = new MockHouseStorage()
  return instance
}

export function newTaskId(): string {
  return `house-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
