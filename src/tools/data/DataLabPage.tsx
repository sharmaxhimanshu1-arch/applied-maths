import { useState } from 'react'
import { Segmented } from '@/ui/Segmented'
import { DataLab } from './DataLab'
import { SCATTER_DATASETS, VALUES_DATASETS } from './datasets'

type Choice = { kind: 'scatter' | 'dots'; id: string }

export default function DataLabPage() {
  const [mode, setMode] = useState<'scatter' | 'dots'>('scatter')
  const [choice, setChoice] = useState<Choice>({ kind: 'scatter', id: SCATTER_DATASETS[0].id })
  const sets = mode === 'scatter' ? SCATTER_DATASETS : VALUES_DATASETS
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Kind of data"
          value={mode}
          onChange={(m) => {
            setMode(m)
            setChoice({ kind: m, id: (m === 'scatter' ? SCATTER_DATASETS : VALUES_DATASETS)[0].id })
          }}
          options={[
            { value: 'scatter', label: 'Two variables (scatter)' },
            { value: 'dots', label: 'One variable (dot plot)' },
          ]}
        />
        <label className="flex items-center gap-2 text-sm text-ink-2">
          Dataset
          <select
            value={choice.id}
            onChange={(e) => setChoice({ kind: mode, id: e.target.value })}
            className="h-9 rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink"
          >
            {sets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <DataLab
          key={`${choice.kind}-${choice.id}`}
          preset={{ mode: choice.kind, dataset: choice.id, height: 440 }}
        />
      </div>
    </div>
  )
}
