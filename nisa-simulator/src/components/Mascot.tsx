/**
 * マスコット「双葉ちゃん」: お金が育つ＝双葉のキャラ。
 * - hexのみのインラインSVG（画像化セーフ）。
 * - ガードレール: 役割は「発話者」。数字の近くではミニサイズ・装飾過多にしない。
 */
export type MascotPose = 'wave' | 'point' | 'cheer' | 'think';

interface MascotProps {
  pose?: MascotPose;
  className?: string;
  title?: string;
}

export function Mascot({ pose = 'wave', className, title }: MascotProps) {
  return (
    <svg
      viewBox="0 0 120 124"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      {/* 双葉（茎＋葉） */}
      <rect x="57" y="20" width="6" height="26" rx="3" fill="#36A35B" />
      <path d="M60 30 C44 20 30 24 28 38 C44 44 56 40 60 30 Z" fill="#43BE72" />
      <path d="M60 30 C76 20 90 24 92 38 C76 44 64 40 60 30 Z" fill="#4FCB7E" />
      <circle cx="60" cy="30" r="4" fill="#FFD27A" />

      {/* 体（種／コイン） */}
      <ellipse cx="60" cy="80" rx="40" ry="38" fill="#FF9E80" />
      <ellipse cx="60" cy="86" rx="28" ry="26" fill="#FFCBB6" />

      {/* 頬 */}
      <circle cx="40" cy="84" r="6" fill="#FF7A59" opacity="0.5" />
      <circle cx="80" cy="84" r="6" fill="#FF7A59" opacity="0.5" />

      {/* 目（ポーズで表情を変える） */}
      {pose === 'think' ? (
        <>
          <circle cx="48" cy="74" r="4.2" fill="#3A2A22" />
          <circle cx="72" cy="71" r="4.2" fill="#3A2A22" />
        </>
      ) : (
        <>
          <circle cx="48" cy="76" r="4.6" fill="#3A2A22" />
          <circle cx="72" cy="76" r="4.6" fill="#3A2A22" />
          <circle cx="49.6" cy="74.4" r="1.4" fill="#FFFFFF" />
          <circle cx="73.6" cy="74.4" r="1.4" fill="#FFFFFF" />
        </>
      )}

      {/* 口 */}
      {pose === 'cheer' ? (
        <path d="M50 88 Q60 100 70 88 Q60 94 50 88 Z" fill="#9A3B2A" />
      ) : pose === 'think' ? (
        <path d="M54 90 Q60 87 66 90" stroke="#9A3B2A" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M52 88 Q60 96 68 88" stroke="#9A3B2A" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}

      {/* 手・アクセント（ポーズ別） */}
      {pose === 'wave' && (
        <g fill="#FF8A66">
          <circle cx="98" cy="64" r="8" />
          <circle cx="22" cy="92" r="7" />
        </g>
      )}
      {pose === 'point' && (
        <g fill="#FF8A66">
          <circle cx="96" cy="92" r="8" />
          <path d="M101 92 l10 8" stroke="#FF8A66" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {pose === 'cheer' && (
        <g>
          <circle cx="22" cy="58" r="7" fill="#FF8A66" />
          <circle cx="98" cy="58" r="7" fill="#FF8A66" />
          <path d="M16 44 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#FFC24B" />
          <path d="M104 46 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#FFC24B" />
        </g>
      )}
      {pose === 'think' && (
        <g fill="#FFB89E">
          <circle cx="92" cy="58" r="4" />
          <circle cx="100" cy="50" r="5.5" />
          <circle cx="110" cy="42" r="7" />
        </g>
      )}
    </svg>
  );
}
