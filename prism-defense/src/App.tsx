import { useState } from 'react';
import type { Screen } from './types/game';
import { useGameState } from './hooks/useGameState';
import { getStage } from './data/stages';
import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { StageSelectScreen } from './screens/StageSelectScreen';
import { BattleScreen } from './screens/BattleScreen';
import { CharactersScreen } from './screens/CharactersScreen';
import { UpgradeScreen } from './screens/UpgradeScreen';
import { GachaScreen } from './screens/GachaScreen';
import { MissionsScreen } from './screens/MissionsScreen';

export default function App() {
  const game = useGameState();
  const [screen, setScreen] = useState<Screen>('home');
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const startBattle = (stageId: string) => {
    setActiveStage(stageId);
    setScreen('battle');
  };

  const exitBattle = () => {
    setActiveStage(null);
    setScreen('stages');
  };

  const inBattle = screen === 'battle' && activeStage;
  const stage = activeStage ? getStage(activeStage) : null;

  return (
    <AppShell>
      {/* Battle takes over the whole frame (no header / nav). */}
      {inBattle && stage ? (
        <BattleScreen game={game} stage={stage} onExit={exitBattle} />
      ) : (
        <>
          <Header title="プリズムディフェンス！" playerLevel={game.save.playerLevel} coins={game.save.coins} />
          <div className="screen-scroll">
            {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
            {screen === 'stages' && (
              <StageSelectScreen game={game} onStart={startBattle} onHome={() => setScreen('home')} />
            )}
            {screen === 'characters' && (
              <CharactersScreen game={game} onUpgrade={() => setScreen('upgrade')} />
            )}
            {screen === 'upgrade' && <UpgradeScreen game={game} />}
            {screen === 'gacha' && <GachaScreen game={game} />}
            {screen === 'missions' && <MissionsScreen game={game} />}
          </div>
          <BottomNav current={screen} onNavigate={setScreen} />
        </>
      )}
    </AppShell>
  );
}
