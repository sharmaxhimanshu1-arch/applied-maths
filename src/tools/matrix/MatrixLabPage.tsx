import { MatrixLab } from './MatrixLab'

export default function MatrixLabPage() {
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <MatrixLab
        preset={{
          matrix: [1, 1, 0, 1],
          extent: 5,
          controls: 'full',
          showShape: true,
          height: 520,
        }}
      />
    </div>
  )
}
