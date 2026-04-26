/* ====================================================================
   Account list types.
   Kept tiny on purpose — this is just enough to ground the per-account
   news prompt and let the user manage the list themselves. Anything
   richer (stage, deal value, contacts list) belongs in a future
   Salesforce integration.
==================================================================== */

export interface Account {
  id:        string
  name:      string             // 'Acme Corp'
  contact?:  string             // 'Sarah Okonkwo, CTO'
  notes?:    string             // freeform context for the AI prompt
  isFocus?:  boolean            // at most one true at a time — today's focus
  createdAt: number
  updatedAt: number
}

export interface NewsState {
  content:   string | null
  loading:   boolean
  error:     boolean
  errorMsg:  string | null
  fetchedAt: number | null
}

export const EMPTY_NEWS: NewsState = {
  content: null, loading: false, error: false, errorMsg: null, fetchedAt: null,
}
