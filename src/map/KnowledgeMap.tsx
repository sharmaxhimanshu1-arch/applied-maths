import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
  useStoreApi,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './map.css'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { areaOf, CONCEPTS, DOMAINS, domainById, graph } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { prefersReducedMotion } from '@/app/theme'
import { hasDeepLab } from '@/labs/registry'
import { NODE_STATE_LABEL, nodeState } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { AreaDot } from '@/ui/Card'
import { cn } from '@/ui/cn'
import { ConceptNode, LaneNode, type ConceptNodeData, type Emphasis } from './ConceptNode'
import { DEFAULT_LAYOUT, layoutMap } from './layout'

const MAP_LAYOUT = layoutMap(CONCEPTS, DOMAINS, graph)

const LANE_PAD_X = 40
const nodeTypes = { concept: ConceptNode, lane: LaneNode }
const EMPTY: ReadonlySet<ConceptId> = new Set()

type EdgeKind = 'normal' | 'strong' | 'soft' | 'faint'
const EDGE_STYLE: Record<EdgeKind, CSSProperties> = {
  normal: { stroke: 'var(--axis)', strokeWidth: 1.4, opacity: 0.4 },
  strong: { stroke: 'var(--accent)', strokeWidth: 2.5, opacity: 1 },
  soft: { stroke: 'var(--accent)', strokeWidth: 1.75, opacity: 0.5, strokeDasharray: '6 5' },
  faint: { stroke: 'var(--axis)', strokeWidth: 1.25, opacity: 0.12 },
}

export type CenterRequest = { id: ConceptId; nonce: number } | null

type Props = {
  selected: ConceptId | null
  hovered: ConceptId | null
  onSelect: (id: ConceptId | null) => void
  onHover: (id: ConceptId | null) => void
  goal: ConceptId | null
  pathMode: boolean
  trackSet: ReadonlySet<ConceptId>
  initialFocus: ConceptId
  centerRequest: CenterRequest
  /** Leaves room on the right for the side panel. */
  panelOpen: boolean
}

export function KnowledgeMap(props: Props) {
  return (
    <ReactFlowProvider>
      <MapCanvas {...props} />
    </ReactFlowProvider>
  )
}

const laneNodes: Node[] = MAP_LAYOUT.lanes.map((lane) => ({
  id: `lane-${lane.domain}`,
  type: 'lane',
  position: { x: -LANE_PAD_X, y: lane.y },
  data: { domain: lane.domain, width: MAP_LAYOUT.width + LANE_PAD_X * 2, height: lane.height },
  width: MAP_LAYOUT.width + LANE_PAD_X * 2,
  height: lane.height,
  draggable: false,
  selectable: false,
  focusable: false,
  zIndex: -1,
}))

function MapCanvas({
  selected,
  hovered,
  onSelect,
  onHover,
  goal,
  pathMode,
  trackSet,
  initialFocus,
  centerRequest,
  panelOpen,
}: Props) {
  const concepts = useProgress((s) => s.concepts)
  const rf = useReactFlow()

  const { nodes, edges } = useMemo(() => {
    const focus = hovered ?? selected
    const anc = focus ? graph.ancestors(focus) : EMPTY
    const desc = focus ? graph.descendants(focus) : EMPTY
    const pathSet = !focus && pathMode && goal ? graph.closure([goal]) : null

    const emphasis = (id: ConceptId): Emphasis => {
      if (focus) {
        if (id === focus) return 'focus'
        if (anc.has(id)) return 'ancestor'
        if (desc.has(id)) return 'descendant'
        return 'dim'
      }
      if (pathSet) return pathSet.has(id) ? 'path' : 'dim'
      return 'none'
    }

    const conceptNodes: Node[] = CONCEPTS.map((c) => {
      const p = MAP_LAYOUT.nodes.get(c.id)!
      const state = nodeState(concepts, c.id)
      const data: ConceptNodeData = {
        concept: c,
        state,
        emphasis: emphasis(c.id),
        selected: c.id === selected,
        inTrack: trackSet.has(c.id),
        deep: hasDeepLab(c.id),
        goal: c.id === goal,
      }
      return {
        id: c.id,
        type: 'concept',
        position: { x: p.x, y: p.y },
        // Fixed sizes: the minimap and edges never wait on DOM measurement.
        width: DEFAULT_LAYOUT.nodeWidth,
        height: DEFAULT_LAYOUT.nodeHeight,
        data,
        draggable: false,
        ariaLabel: `${c.title}. ${NODE_STATE_LABEL[state]}.`,
      }
    })

    const inChain = (set: ReadonlySet<ConceptId>, id: ConceptId) => id === focus || set.has(id)
    const edgeList: Edge[] = []
    for (const c of CONCEPTS) {
      for (const p of graph.prereqs.get(c.id)!) {
        let kind: EdgeKind = 'normal'
        if (focus) {
          if (inChain(anc, p) && inChain(anc, c.id)) kind = 'strong'
          else if (inChain(desc, p) && inChain(desc, c.id)) kind = 'soft'
          else kind = 'faint'
        } else if (pathSet) {
          kind = pathSet.has(p) && pathSet.has(c.id) ? 'strong' : 'faint'
        }
        edgeList.push({
          id: `${p}->${c.id}`,
          source: p,
          target: c.id,
          style: EDGE_STYLE[kind],
          data: { kind },
          focusable: false,
          selectable: false,
        })
      }
    }
    // Highlighted edges are drawn last (on top of other edges, still beneath the nodes).
    const order: Record<EdgeKind, number> = { faint: 0, normal: 1, soft: 2, strong: 3 }
    edgeList.sort(
      (a, b) =>
        order[(a.data as { kind: EdgeKind }).kind] - order[(b.data as { kind: EdgeKind }).kind],
    )
    return { nodes: [...laneNodes, ...conceptNodes], edges: edgeList }
  }, [concepts, selected, hovered, goal, pathMode, trackSet])

  const store = useStoreApi()
  const panelOpenRef = useRef(panelOpen)
  useEffect(() => {
    panelOpenRef.current = panelOpen
  }, [panelOpen])
  const centerOn = useCallback(
    (id: ConceptId, instant = false) => {
      const p = MAP_LAYOUT.nodes.get(id)
      if (!p) return
      const { height } = store.getState()
      // With the side panel open, centre within the space left of it.
      const width = store.getState().width - (panelOpenRef.current ? 376 : 0)
      const zoom = Math.max(rf.getZoom(), 0.85)
      const cx = p.x + DEFAULT_LAYOUT.nodeWidth / 2
      const cy = p.y + DEFAULT_LAYOUT.nodeHeight / 2
      // Centre the node, but never leave empty space left of or above the map's edge.
      const x = Math.min(width / 2 - cx * zoom, 160 + LANE_PAD_X * zoom)
      const y = Math.min(height / 2 - cy * zoom, 84)
      void rf.setViewport({ x, y, zoom }, { duration: instant || prefersReducedMotion() ? 0 : 450 })
    },
    [rf, store],
  )

  useEffect(() => {
    if (centerRequest) centerOn(centerRequest.id)
  }, [centerRequest, centerOn])

  // Our own selection (not React Flow's) is the single source of truth; keyboard users
  // focus a node with Tab and open it with Enter or Space.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const node = (e.target as HTMLElement).closest<HTMLElement>('.react-flow__node-concept')
    if (!node?.dataset.id) return
    e.preventDefault()
    onSelect(node.dataset.id)
  }

  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- delegates Enter/Space from focusable nodes
    <div
      className={cn('knowledge-map relative h-full w-full', panelOpen && 'panel-open')}
      onKeyDown={onKeyDown}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={() => centerOn(initialFocus, true)}
        onNodeClick={(_, node) => node.type === 'concept' && onSelect(node.id)}
        onNodeMouseEnter={(_, node) => node.type === 'concept' && onHover(node.id)}
        onNodeMouseLeave={() => onHover(null)}
        onPaneClick={() => onSelect(null)}
        elementsSelectable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={0.15}
        translateExtent={[
          [-700, -500],
          [MAP_LAYOUT.width + 700, MAP_LAYOUT.height + 500],
        ]}
        maxZoom={1.75}
        attributionPosition="bottom-left"
        aria-label="Knowledge map of all concepts"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="var(--grid-strong)"
        />
        <Controls showInteractive={false} position="bottom-right" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          style={{ marginRight: 64 }}
          className="max-md:!hidden"
          nodeBorderRadius={10}
          nodeColor={(n) =>
            n.type === 'lane'
              ? 'transparent'
              : areaOf((n.data as ConceptNodeData).concept.domain).color
          }
          ariaLabel="Overview of the whole map"
        />
        <LaneLabels />
      </ReactFlow>
    </div>
  )
}

const STICKY_TOP = 76

/** Domain names pinned to the left edge, following their lane as you pan and zoom. */
function LaneLabels() {
  const transform = useStore((s) => s.transform)
  const height = useStore((s) => s.height)
  const [, ty, zoom] = transform
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-[4]" aria-hidden>
      {MAP_LAYOUT.lanes.map((lane) => {
        const top = lane.y * zoom + ty
        const bottom = top + lane.height * zoom
        if (bottom < STICKY_TOP || top > height) return null
        const labelTop = Math.min(Math.max(top + 8, STICKY_TOP), bottom - 30)
        if (labelTop < STICKY_TOP - 24) return null
        const domain = domainById.get(lane.domain)!
        return (
          <div
            key={lane.domain}
            style={{ top: labelTop }}
            className="absolute left-3 flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-ink-2 shadow-sm backdrop-blur"
          >
            <AreaDot color={areaOf(lane.domain).color} />
            {domain.title}
          </div>
        )
      })}
    </div>
  )
}
