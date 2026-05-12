"use client";

import { useState } from "react";

interface ExpandableDescriptionProps {
  description: string;
}

export default function ExpandableDescription({
  description,
}: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-3">
      <p
        className={`text-sm leading-relaxed text-muted ${expanded ? "" : "line-clamp-3"}`}
      >
        {description}
      </p>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
      >
        {expanded ? "ย่อ" : "อ่านเพิ่มเติม"}
      </button>
    </div>
  );
}
