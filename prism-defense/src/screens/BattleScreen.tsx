import { useEffect, useRef, useState, useCallback } from 'react';
import type { GameState } from '../hooks/useGameState';
import type { BattleUnit, Range, StageDef } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { getEnemy } from '../data/enemies';
import { BattleField } from '../components/BattleField';
import { UnitCard } from '../components/UnitCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ResultOverlay } from '../components/ResultOverlay';

interface Props {
  game: GameState;
  stage: StageDef;
  onExit: () => void;
}

// ---- tuning constants ----
const FIELD_MIN = 8;
const FIELD_MAX = 92;
const ALLY_SPAWN = FIELD_MIN;
const ENEMY_SPAWN = FIELD_MAX;
const FUND_CAP = 1000;
const FUND_RATE = 28; // funds per second
const START_FUND = 150;
const ATTACK_INTERVAL = 1; // seconds between hits

const rangePx = (r: Range) => (r === 'long' ? 20 : 7);

let uidCounter = 0;
const nextUid = () => `u${uidCounter++}`;

interface SimState {
  units: BattleUnit[];
  funds: number;
  elapsed: number;
  allyBaseHp: number;
  enemyBaseHp: number;
  spawnIdx: number;
  cooldowns: Record<string, number>;
  specialCd: number;
  result: 'win' | 'lose' | null;
}

export function BattleScreen({ game, stage, onExit }: Props) {
  const allyBaseMax = stage.baseHp;
  const enemyBaseMax = stage.enemyBaseHp;

  const sim = useRef<SimState>({
    units: [],
    funds: START_FUND,
    elapsed: 0,
    allyBaseHp: stage.baseHp,
    enemyBaseHp: stage.enemyBaseHp,
    spawnIdx: 0,
    cooldowns: {},
    specialCd: 0,
    result: null,
  });

  // Snapshot mirrored into React for rendering.
  const [view, setView] = useState<SimState>(sim.current);
  const rewardGiven = useRef(false);

  const summon = useCallback((charId: string) => {
    const s = sim.current;
    if (s.result) return;
    const stats = game.charStats(charId);
    const cost = stats.def.cost;
    if (s.funds < cost) return;
    if ((s.cooldowns[charId] ?? 0) > 0) return;
    s.funds -= cost;
    s.cooldowns[charId] = stats.def.cooldown;
    s.units.push({
      uid: nextUid(),
      defId: charId,
      team: 'ally',
      name: stats.def.name,
      emoji: stats.def.emoji,
      color: stats.def.color,
      hp: stats.hp,
      maxHp: stats.hp,
      atk: stats.atk,
      speed: stats.def.speed,
      range: stats.def.range,
      reward: 0,
      x: ALLY_SPAWN,
      attackTimer: 0,
      hitFlash: 0,
    });
  }, [game]);

  const useSpecial = useCallback(() => {
    const s = sim.current;
    if (s.result || s.specialCd > 0) return;
    s.specialCd = 20;
    // Prism Burst: damage all enemy units + a chunk of enemy base.
    for (const u of s.units) {
      if (u.team === 'enemy') {
        u.hp -= 80;
        u.hitFlash = 0.3;
      }
    }
    s.enemyBaseHp = Math.max(0, s.enemyBaseHp - 60);
  }, []);

  // ---- main simulation loop ----
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const spawnEnemy = (enemyId: string) => {
      const def = getEnemy(enemyId);
      if (!def) return;
      sim.current.units.push({
        uid: nextUid(),
        defId: def.id,
        team: 'enemy',
        name: def.name,
        emoji: def.emoji,
        color: def.color,
        hp: def.hp,
        maxHp: def.hp,
        atk: def.atk,
        speed: def.speed,
        range: 'short',
        reward: def.reward,
        x: ENEMY_SPAWN,
        attackTimer: 0,
        hitFlash: 0,
      });
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;

      if (!s.result) {
        s.elapsed += dt;
        s.funds = Math.min(FUND_CAP, s.funds + FUND_RATE * dt);

        // cooldowns
        for (const k of Object.keys(s.cooldowns)) {
          if (s.cooldowns[k] > 0) s.cooldowns[k] = Math.max(0, s.cooldowns[k] - dt);
        }
        if (s.specialCd > 0) s.specialCd = Math.max(0, s.specialCd - dt);

        // timed spawns
        while (s.spawnIdx < stage.spawns.length && stage.spawns[s.spawnIdx].at <= s.elapsed) {
          spawnEnemy(stage.spawns[s.spawnIdx].enemyId);
          s.spawnIdx++;
        }

        // per-unit AI
        for (const u of s.units) {
          if (u.hitFlash > 0) u.hitFlash = Math.max(0, u.hitFlash - dt);
          if (u.attackTimer > 0) u.attackTimer = Math.max(0, u.attackTimer - dt);

          const dir = u.team === 'ally' ? 1 : -1;
          // find nearest enemy in front within range
          const reach = rangePx(u.range);
          let target: BattleUnit | null = null;
          let bestDist = Infinity;
          for (const o of s.units) {
            if (o.team === u.team || o.hp <= 0) continue;
            const d = (o.x - u.x) * dir; // positive = in front
            if (d >= -2 && d <= reach + 2) {
              const ad = Math.abs(o.x - u.x);
              if (ad < bestDist) { bestDist = ad; target = o; }
            }
          }

          // base in range?
          const atEnemyBase = u.team === 'ally' && u.x >= FIELD_MAX - 1;
          const atAllyBase = u.team === 'enemy' && u.x <= FIELD_MIN + 1;

          if (target) {
            if (u.attackTimer <= 0) {
              target.hp -= u.atk;
              target.hitFlash = 0.25;
              u.attackTimer = ATTACK_INTERVAL;
            }
          } else if (atEnemyBase) {
            if (u.attackTimer <= 0) { s.enemyBaseHp = Math.max(0, s.enemyBaseHp - u.atk); u.attackTimer = ATTACK_INTERVAL; }
          } else if (atAllyBase) {
            if (u.attackTimer <= 0) { s.allyBaseHp = Math.max(0, s.allyBaseHp - u.atk); u.attackTimer = ATTACK_INTERVAL; }
          } else {
            // advance
            u.x += dir * u.speed * dt;
            u.x = Math.max(FIELD_MIN, Math.min(FIELD_MAX, u.x));
          }
        }

        // reward funds for killed enemies, then cull dead
        const survivors: BattleUnit[] = [];
        for (const u of s.units) {
          if (u.hp <= 0) {
            if (u.team === 'enemy') s.funds = Math.min(FUND_CAP, s.funds + u.reward);
          } else {
            survivors.push(u);
          }
        }
        s.units = survivors;

        // win / lose
        if (s.enemyBaseHp <= 0) s.result = 'win';
        else if (s.allyBaseHp <= 0) s.result = 'lose';
      }

      // mirror snapshot (shallow clone for React)
      setView({ ...s, units: s.units.map((u) => ({ ...u })), cooldowns: { ...s.cooldowns } });
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  // grant reward once when battle is won
  useEffect(() => {
    if (view.result === 'win' && !rewardGiven.current) {
      rewardGiven.current = true;
      game.clearStage(stage.id, stage.rewardCoins);
    }
  }, [view.result, game, stage]);

  const mm = Math.floor(view.elapsed / 60);
  const ss = Math.floor(view.elapsed % 60).toString().padStart(2, '0');

  return (
    <div className="battle">
      <div className="battle-hud">
        <div className="battle-hud__bases">
          <div className="battle-hud__base">
            <small>味方ベース ❤️</small>
            <HpMini value={view.allyBaseHp} max={allyBaseMax} ally />
          </div>
        </div>
        <div className="battle-hud__center">
          <div className="battle-hud__fund">🪙 {Math.floor(view.funds)}</div>
          <div className="battle-hud__time">⏱ {mm}:{ss} · {stage.name}</div>
        </div>
        <div className="battle-hud__bases">
          <div className="battle-hud__base">
            <small>敵ベース 💀</small>
            <HpMini value={view.enemyBaseHp} max={enemyBaseMax} />
          </div>
        </div>
      </div>

      <BattleField
        units={view.units}
        allyBaseHp={view.allyBaseHp}
        allyBaseMax={allyBaseMax}
        enemyBaseHp={view.enemyBaseHp}
        enemyBaseMax={enemyBaseMax}
      />

      <div className="fundbar">
        <div className="fundbar__fill" style={{ width: `${(view.funds / FUND_CAP) * 100}%` }} />
      </div>

      <div className="dock">
        <div className="dock__cards">
          {CHARACTERS.map((def) => (
            <UnitCard
              key={def.id}
              def={def}
              affordable={view.funds >= def.cost}
              cooldown={(view.cooldowns[def.id] ?? 0) / def.cooldown}
              onSummon={() => summon(def.id)}
            />
          ))}
        </div>
        <div className="dock__side">
          <PrimaryButton
            size="sm"
            variant="accent"
            disabled={view.specialCd > 0}
            onClick={useSpecial}
          >
            {view.specialCd > 0 ? `✨${Math.ceil(view.specialCd)}` : '✨必殺'}
          </PrimaryButton>
          <PrimaryButton size="sm" variant="ghost" onClick={onExit}>
            撤退
          </PrimaryButton>
        </div>
      </div>

      {view.result && (
        <ResultOverlay
          result={view.result}
          rewardCoins={stage.rewardCoins}
          onClose={onExit}
        />
      )}
    </div>
  );
}

function HpMini({ value, max, ally }: { value: number; max: number; ally?: boolean }) {
  const pct = Math.max(0, (value / max) * 100);
  return (
    <div className="hpbar" style={{ height: 8 }}>
      <div
        className="hpbar__fill"
        style={{ width: `${pct}%`, background: ally ? undefined : 'linear-gradient(90deg, var(--c-danger), #ff96ad)' }}
      />
    </div>
  );
}
