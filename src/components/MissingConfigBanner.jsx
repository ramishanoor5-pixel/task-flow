import { useState } from 'react'
import { KeyRound, ChevronRight, X, ShieldAlert, Check } from 'lucide-react'

export default function MissingConfigBanner() {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border-b border-amber-500/20 text-slate-200 text-xs py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold shrink-0">
            !
          </span>
          <p className="font-medium text-amber-200/90">
            <strong>Running in Sandbox Mode:</strong> Real Firebase keys aren't detected in <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">.env.local</code>. Everything works in-memory/local storage, and you can plug in real Firebase anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{open ? 'Hide Setup Guide' : 'Connect Firebase (1 min)'}</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 max-w-7xl mx-auto p-4 rounded-xl bg-slate-900/95 border border-slate-800 text-slate-300 space-y-3 animate-in fade-in">
          <h4 className="font-semibold text-white text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            How to link your live Firebase Project:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
            <li>
              Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-medium hover:text-indigo-300">Firebase Console</a> and click <strong>Create a project</strong>.
            </li>
            <li>
              Enable <strong>Authentication</strong> &rarr; Click <strong>Sign-in method</strong> &rarr; Enable <strong>Email/Password</strong>.
            </li>
            <li>
              Enable <strong>Firestore Database</strong> &rarr; Click <strong>Create database</strong> (choose Start in test mode or paste the included rules in <code className="text-indigo-300 font-mono">firestore.rules</code>).
            </li>
            <li>
              Under <strong>Project settings</strong> &rarr; <strong>General</strong> &rarr; <strong>Your apps</strong> &rarr; Register Web App &rarr; Copy the config keys.
            </li>
            <li>
              Paste the keys into your project's <code className="text-amber-300 font-mono">.env.local</code> file (which is already safeguarded by <code className="text-indigo-300 font-mono">.gitignore</code>) and restart the dev server!
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
