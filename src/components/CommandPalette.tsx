import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type Command = {
  id: string
  label: string
  hint?: string
  action: () => void
}

const CommandPalette: React.FC<{
  open: boolean
  onClose: () => void
  commands: Command[]
}> = ({ open, onClose, commands }) => {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return commands
    return commands.filter(c => c.label.toLowerCase().includes(q) || (c.hint?.toLowerCase().includes(q)))
  }, [query, commands])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative max-w-xl mx-auto mt-24 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="bg-white p-3 border-b">
              <input
                autoFocus
                value={query}
                onChange={(e)=> setQuery(e.target.value)}
                placeholder="Type a command… (e.g. dashboard, simulator, toggle)"
                className="w-full outline-none text-gray-900 placeholder-gray-400 text-sm px-3 py-2 bg-gray-50 rounded-lg border"
              />
            </div>
            <div className="bg-white max-h-80 overflow-auto">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No matches</div>
              ) : (
                filtered.map(cmd => (
                  <button
                    key={cmd.id}
                    onClick={()=> { cmd.action(); onClose(); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-none"
                  >
                    <div className="text-sm text-gray-900">{cmd.label}</div>
                    {cmd.hint && <div className="text-xs text-gray-500">{cmd.hint}</div>}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommandPalette

