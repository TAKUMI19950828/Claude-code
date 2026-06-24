import { useState } from 'react';
import type { CharacterDef } from '../types/game';

interface Props {
  def: CharacterDef;
  size?: number | string;
  className?: string;
}

/**
 * Resolves a character's artwork with graceful fallback:
 *   1. PNG illustration  (public/characters/<id>.png)
 *   2. SVG placeholder    (public/characters/<id>.svg)
 *   3. emoji              (def.emoji)
 *
 * Drop a real PNG into public/characters/ and it is picked up automatically —
 * no code change needed.
 */
export function CharacterSprite({ def, size = '100%', className }: Props) {
  // Build the candidate list once (png -> svg).
  const sources = [`characters/${def.id}.png`, def.sprite].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);

  const dim = typeof size === 'number' ? `${size}px` : size;

  if (idx >= sources.length) {
    // All image sources failed — fall back to emoji.
    return (
      <span className={className} style={{ fontSize: typeof size === 'number' ? size * 0.55 : '2.4em' }}>
        {def.emoji}
      </span>
    );
  }

  return (
    <img
      className={className}
      src={sources[idx]}
      alt={def.name}
      style={{ width: dim, height: dim, objectFit: 'contain' }}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
