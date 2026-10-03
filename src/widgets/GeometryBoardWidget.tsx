import type { WidgetComponentProps } from './types'
import { AngleMode } from './geometry/AngleMode'
import { BoxMode } from './geometry/BoxMode'
import { CircleMode } from './geometry/CircleMode'
import { CoordinatesMode } from './geometry/CoordinatesMode'
import { DistanceMode } from './geometry/DistanceMode'
import { LawMode } from './geometry/LawMode'
import { PythagorasMode } from './geometry/PythagorasMode'
import { RectangleMode } from './geometry/RectangleMode'
import { RigidMode } from './geometry/RigidMode'
import { SimilarityMode } from './geometry/SimilarityMode'
import { TriangleMode } from './geometry/TriangleMode'

export type { GeometryBoardPreset, GeometryBoardState } from './geometry/types'

/** One board, many constructions: each mode is its own small interactive. */
export default function GeometryBoardWidget({
  preset: p,
  onStateChange: on,
}: WidgetComponentProps<'geometryBoard'>) {
  switch (p.mode) {
    case 'coordinates':
      return <CoordinatesMode start={p.start} targets={p.targets} onState={on} />
    case 'angle':
      return <AngleMode start={p.start} onState={on} />
    case 'rectangle':
      return <RectangleMode w={p.w} h={p.h} onState={on} />
    case 'triangle':
      return <TriangleMode points={p.points} onState={on} />
    case 'circle':
      return <CircleMode r={p.r} slices={p.slices} onState={on} />
    case 'pythagoras':
      return <PythagorasMode a={p.a} b={p.b} onState={on} />
    case 'similarity':
      return <SimilarityMode k={p.k} onState={on} />
    case 'distance':
      return <DistanceMode a={p.a} b={p.b} onState={on} />
    case 'rigid':
      return <RigidMode onState={on} />
    case 'box':
      return <BoxMode l={p.l} w={p.w} h={p.h} onState={on} />
    case 'law':
      return <LawMode points={p.points} onState={on} />
  }
}
