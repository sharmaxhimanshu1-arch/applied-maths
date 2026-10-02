import katex from 'katex'

const formula = katex.renderToString('e^{i\\pi} + 1 = 0', { throwOnError: false })

export function App() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">Applied Maths Lab</h1>
      <p className="mt-2 opacity-70">Learn math by touching it. The lab is being assembled.</p>
      <p className="mt-6 text-2xl" dangerouslySetInnerHTML={{ __html: formula }} />
    </main>
  )
}
