import { useCallback, useEffect, useState } from 'react'
import type { Account } from '../clients/types'
import {
  readAccounts, writeAccounts,
  buildAccount, applyUpdate, applyFocus, applyRemove,
} from '../clients/storage'

/* ====================================================================
   Account list hook.
   Single source of truth for the user's account list. Keeps state in
   memory and syncs every change to localStorage immediately so a
   refresh never loses an edit.
==================================================================== */

export interface UseAccounts {
  accounts:  Account[]
  focus:     Account | null
  add:       (input: { name: string; contact?: string; notes?: string }) => Account
  update:    (id: string, patch: Partial<Pick<Account, 'name' | 'contact' | 'notes'>>) => void
  remove:    (id: string) => void
  setFocus:  (id: string | null) => void
}

export function useAccounts(): UseAccounts {
  const [accounts, setAccounts] = useState<Account[]>(readAccounts)

  useEffect(() => { writeAccounts(accounts) }, [accounts])

  const add = useCallback((input: { name: string; contact?: string; notes?: string }) => {
    const created = buildAccount(input)
    setAccounts(prev => {
      // First account becomes the focus by default so the screen has
      // something to lead with rather than a wall of collapsed cards.
      const isFirst = prev.length === 0
      return [...prev, isFirst ? { ...created, isFocus: true } : created]
    })
    return created
  }, [])

  const update = useCallback((id: string, patch: Partial<Pick<Account, 'name' | 'contact' | 'notes'>>) => {
    setAccounts(prev => applyUpdate(prev, id, patch))
  }, [])

  const remove = useCallback((id: string) => {
    setAccounts(prev => applyRemove(prev, id))
  }, [])

  const setFocus = useCallback((id: string | null) => {
    setAccounts(prev => applyFocus(prev, id))
  }, [])

  const focus = accounts.find(a => a.isFocus) ?? null

  return { accounts, focus, add, update, remove, setFocus }
}
