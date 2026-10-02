import { useState } from 'react'
import { Segmented } from '@/ui/Segmented'
import { CoinExperiment, type CoinPreset, type CoinState } from './CoinExperiment'
import { DiceExperiment, type DicePreset, type DiceState } from './DiceExperiment'
import { GaltonBoard, type GaltonPreset, type GaltonState } from './GaltonBoard'
import { SamplingExperiment, type SamplingPreset, type SamplingState } from './SamplingExperiment'
import { SpinnerExperiment, type SpinnerPreset, type SpinnerState } from './SpinnerExperiment'

export type ProbabilityPreset =
  | { experiment: 'coin'; options?: CoinPreset }
  | { experiment: 'dice'; options?: DicePreset }
  | { experiment: 'spinner'; options?: SpinnerPreset }
  | { experiment: 'galton'; options?: GaltonPreset }
  | { experiment: 'sampling'; options?: SamplingPreset }

export type ProbabilityState = CoinState | DiceState | SpinnerState | GaltonState | SamplingState

type Experiment = ProbabilityPreset['experiment']

/** One experiment, configured by a preset (used by labs). */
export function ProbabilityExperiment({
  preset,
  onStateChange,
}: {
  preset: ProbabilityPreset
  onStateChange?: (s: ProbabilityState) => void
}) {
  switch (preset.experiment) {
    case 'coin':
      return <CoinExperiment preset={preset.options} onStateChange={onStateChange} />
    case 'dice':
      return <DiceExperiment preset={preset.options} onStateChange={onStateChange} />
    case 'spinner':
      return <SpinnerExperiment preset={preset.options} onStateChange={onStateChange} />
    case 'galton':
      return <GaltonBoard preset={preset.options} onStateChange={onStateChange} />
    case 'sampling':
      return <SamplingExperiment preset={preset.options} onStateChange={onStateChange} />
  }
}

const TABS: { value: Experiment; label: string }[] = [
  { value: 'coin', label: 'Coins' },
  { value: 'dice', label: 'Dice' },
  { value: 'spinner', label: 'Spinner' },
  { value: 'galton', label: 'Galton board' },
  { value: 'sampling', label: 'Sampling & CLT' },
]

/** The tool page: every experiment behind tabs. */
export default function ProbabilityLabPage() {
  const [tab, setTab] = useState<Experiment>('coin')
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <Segmented label="Experiment" value={tab} onChange={setTab} options={TABS} />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <ProbabilityExperiment key={tab} preset={{ experiment: tab } as ProbabilityPreset} />
      </div>
    </div>
  )
}
