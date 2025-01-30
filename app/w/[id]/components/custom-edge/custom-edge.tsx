import { EdgeProps, getSmoothStepPath } from 'reactflow'
import { X } from 'lucide-react'

export const CustomEdge = (props: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  })

  const midPoint = {
    x: (props.sourceX + props.targetX) / 2,
    y: (props.sourceY + props.targetY) / 2,
  }

  const isSelected = props.id === props.data?.selectedEdgeId

  return (
    <g>
      <path
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        className="react-flow__edge-interaction"
      />
      <path
        d={edgePath}
        strokeWidth={2}
        stroke={isSelected ? '#475569' : '#94a3b8'}
        fill="none"
        strokeDasharray="5,5"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="10"
          to="0"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>

      {isSelected && (
        <foreignObject
          width={24}
          height={24}
          x={midPoint.x - 12}
          y={midPoint.y - 12}
          className="overflow-visible"
        >
          <div
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#FAFBFC]"
            onClick={(e) => {
              e.stopPropagation()
              props.data?.onDelete?.(props.id)
            }}
          >
            <X className="h-5 w-5 text-red-500" />
          </div>
        </foreignObject>
      )}
    </g>
  )
}
