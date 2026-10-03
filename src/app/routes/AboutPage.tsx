import { ButtonLink } from '@/ui/Button'
import { CONCEPTS } from '@/curriculum'
import { useDocumentTitle } from '../theme'

export function AboutPage() {
  useDocumentTitle('About')
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">About Applied Maths Lab</h1>
      <div className="prose-lab mt-6">
        <p>
          Math gets boring when it's only symbols on a page. Here you learn every idea by touching
          it: drag a point and watch a slope change, warp the plane with a matrix, or flip a
          thousand coins in a second.
        </p>
        <p>
          The <strong>knowledge map</strong> holds {CONCEPTS.length} concepts, from the number line
          to neural networks. Each one lists what you need first and what it unlocks, so you always
          know where you are and what comes next. Set a goal and the lab works out your personal
          path to it.
        </p>
        <p>Every concept page follows the same arc:</p>
        <ol>
          <li>
            <strong>Hook.</strong> Why the idea matters.
          </li>
          <li>
            <strong>Explore.</strong> A visual you can manipulate, with prompts that tick themselves
            off as you discover things.
          </li>
          <li>
            <strong>Formalize.</strong> The formula, once you've seen what it means.
          </li>
          <li>
            <strong>Practice.</strong> Quick checks and interactive challenges.
          </li>
          <li>
            <strong>Real world.</strong> Where the idea shows up.
          </li>
        </ol>
        <p>
          Your progress stays in this browser. Nothing is sent anywhere. You can export it from the
          Progress page and import it on another device.
        </p>
      </div>
      <div className="mt-8 flex gap-2">
        <ButtonLink to="/map" variant="primary">
          Explore the map
        </ButtonLink>
        <ButtonLink to="/tools">Open the tools</ButtonLink>
      </div>
    </article>
  )
}
