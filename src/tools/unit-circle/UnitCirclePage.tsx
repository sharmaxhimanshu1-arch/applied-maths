import { UnitCircle } from './UnitCircle'

export default function UnitCirclePage() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <UnitCircle preset={{ theta: Math.PI / 4 }} />
    </div>
  )
}
