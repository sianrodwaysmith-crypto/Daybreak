/**
 * House drawer types. Module-internal.
 */

export type TaskStatus = 'todo' | 'done'

export interface HouseTask {
  id:        string
  title:     string
  note?:     string
  status:    TaskStatus
  doneAt?:   string                     // set when status flips to 'done'
  createdAt: string
  updatedAt: string
}
