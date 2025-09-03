import React from 'react';
import type { Branch } from '../types';

interface BranchComponentProps {
  branch: Branch;
  windOffset?: { x: number; y: number };
}

export const BranchComponent: React.FC<BranchComponentProps> = ({
  branch,
  windOffset = { x: 0, y: 0 },
}) => {
  // Apply wind effect - stronger on thinner branches
  const windMultiplier = Math.max(0.2, 1 - branch.thickness / 12);
  const adjustedStart = {
    x: branch.startPoint.x + windOffset.x * windMultiplier * 1.0, // Increased from 0.5
    y: branch.startPoint.y + windOffset.y * windMultiplier * 0.8,
  };
  const adjustedEnd = {
    x: branch.endPoint.x + windOffset.x * windMultiplier * 2.0, // Increased from 1.0
    y: branch.endPoint.y + windOffset.y * windMultiplier * 1.5,
  };

  // Create curved path for more natural look
  const controlPoint1 = {
    x: adjustedStart.x + (adjustedEnd.x - adjustedStart.x) * 0.3,
    y: adjustedStart.y + (adjustedEnd.y - adjustedStart.y) * 0.3 - 10,
  };
  const controlPoint2 = {
    x: adjustedStart.x + (adjustedEnd.x - adjustedStart.x) * 0.7,
    y: adjustedStart.y + (adjustedEnd.y - adjustedStart.y) * 0.7 - 5,
  };

  const pathData = `M ${adjustedStart.x} ${adjustedStart.y} 
                   C ${controlPoint1.x} ${controlPoint1.y}, 
                     ${controlPoint2.x} ${controlPoint2.y}, 
                     ${adjustedEnd.x} ${adjustedEnd.y}`;

  // Color gradient from brown (trunk) to green (branches)
  const colorIntensity = Math.max(0.2, 1 - branch.generation * 0.2);
  const brown = Math.floor(139 * colorIntensity);
  const green = Math.floor(69 * (1 - colorIntensity));
  const branchColor = `rgb(${brown}, ${green + 50}, ${green})`;

  return (
    <g>
      {/* Branch */}
      <path
        d={pathData}
        stroke={branchColor}
        strokeWidth={branch.thickness}
        strokeLinecap="round"
        fill="none"
        style={{
          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
        }}
      />

      {/* Render child branches */}
      {branch.children.map((childBranch) => (
        <BranchComponent key={childBranch.id} branch={childBranch} windOffset={windOffset} />
      ))}

      {/* Render leaves */}
      {branch.leaves.map((leaf) => (
        <g key={leaf.id}>
          <ellipse
            cx={leaf.position.x + windOffset.x * windMultiplier * 4} // Increased from 2
            cy={leaf.position.y + windOffset.y * windMultiplier * 3} // Increased from 2
            rx={leaf.size}
            ry={leaf.size * 0.6}
            fill={leaf.color}
            opacity={leaf.opacity}
            transform={`rotate(${leaf.rotation + windOffset.x * 15} ${leaf.position.x} ${leaf.position.y})`}
            style={{
              filter: 'drop-shadow(0.5px 0.5px 1px rgba(0,0,0,0.2))',
              zIndex: 100 + Math.floor(leaf.position.y), // Higher z-index for leaves closer to bottom
            }}
          />
        </g>
      ))}
    </g>
  );
};
