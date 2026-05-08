import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Backpack, Camera, Crosshair, DoorOpen, Gem, Shield, Skull, Timer, Zap } from 'lucide-react';

type GameState = 'menu' | 'search' | 'fight' | 'retreat' | 'collection';
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type Loot = { name: string; rarity: Rarity; value: number; icon: string; district: string };
type ExtractMethod = 'street' | 'courier' | 'alley';

const LOOT_POOL: Loot[] = [
  { name: '厂牌联名磁带机', rarity: 'legendary', value: 4200, icon: '📼', district: '旧戏院仓库' },
  { name: '停产霓虹招牌灯管', rarity: 'epic', value: 1700, icon: '💡', district: '南城夜市' },
  { name: '地下DJ限定黑胶', rarity: 'rare', value: 850, icon: '💿', district: '码头跳蚤场' },
  { name: '老厂主板改件', rarity: 'rare', value: 680, icon: '🧩', district: '工业遗址' },
  { name: '手写进货账本', rarity: 'uncommon', value: 250, icon: '📔', district: '城中村二手店' },
  { name: '复古机车徽章', rarity: 'common', value: 120, icon: '🏍️', district: '地摊联盟' },
  { name: '失踪工位门禁卡', rarity: 'epic', value: 2100, icon: '🪪', district: '写字楼后巷' },
  { name: '停运公交站牌碎片', rarity: 'uncommon', value: 320, icon: '🪧', district: '北环总站' },
];

const RARITY_LABEL: Record<Rarity, string> = {
  common: '普通',
  uncommon: '精良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const RARITY_CLASS: Record<Rarity, string> = {
  common: 'text-muted-foreground',
  uncommon: 'text-primary',
  rare: 'text-accent',
  epic: 'text-secondary',
  legendary: 'text-amber-300',
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [stamina, setStamina] = useState(100);
  const [focus, setFocus] = useState(100);
  const [heat, setHeat] = useState(0);
  const [bagLoad, setBagLoad] = useState(0);
  const [rivalPressure, setRivalPressure] = useState(100);
  const [inventory, setInventory] = useState<Loot[]>([]);
  const [currentLoot, setCurrentLoot] = useState<Loot | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const generateLoot = (): Loot => LOOT_POOL[Math.floor(Math.random() * LOOT_POOL.length)];

  const startExploring = () => {
    setGameState('search');
    setLogs(['[系统] 进入今晚夜市线，目标：捡漏并安全回仓。', '[情报] 22:00 后稀有货出摊概率提升。']);
    setStamina(100);
    setFocus(100);
    setHeat(20);
    setBagLoad(0);
    setRivalPressure(100);
    setCurrentLoot(null);
  };

  const handleSearch = () => {
    if (focus < 15) {
      setLogs((prev) => [...prev, '[警告] 专注度不足，先撤离更稳妥。']);
      return;
    }

    setFocus((prev) => Math.max(0, prev - 15));
    setStamina((prev) => Math.max(0, prev - 8));
    setHeat((prev) => Math.min(100, prev + 15));
    const loot = generateLoot();
    setCurrentLoot(loot);
    setLogs((prev) => [...prev, `[发现] ${loot.district} 出现 ${loot.name}（${RARITY_LABEL[loot.rarity]}）。`]);

    if (Math.random() > 0.42) {
      setTimeout(() => {
        setGameState('fight');
        setRivalPressure(68 + Math.floor(Math.random() * 28));
        setLogs((prev) => [...prev, '[警告] 其他寻物师盯上你的货，发生争抢。']);
      }, 1500);
    } else {
      setGameState('retreat');
      setLogs((prev) => [...prev, '[系统] 目前无冲突，建议立刻规划撤离路线。']);
    }
  };

  const handleFight = (action: 'attack' | 'defend' | 'flee') => {
    const myMove = action === 'attack' ? 18 + Math.floor(Math.random() * 14) : action === 'defend' ? 8 : 0;
    const rivalMove = action === 'defend' ? 6 + Math.floor(Math.random() * 9) : 10 + Math.floor(Math.random() * 14);
    const staminaLoss = action === 'defend' ? rivalMove : rivalMove + (action === 'flee' ? 6 : 0);
    const nextRivalPressure = rivalPressure - myMove;
    const nextStamina = stamina - staminaLoss;

    setRivalPressure((prev) => Math.max(0, prev - myMove));
    setStamina((prev) => Math.max(0, prev - staminaLoss));
    setHeat((prev) => Math.min(100, prev + 10));
    setLogs((prev) => [
      ...prev,
      `[行动] ${action === 'attack' ? '强势抬价压制对手。' : action === 'defend' ? '护住货箱拖时间。' : '趁乱钻巷脱身。'}`,
      myMove > 0 ? `[压制] 对手压力 -${myMove}。` : '[压制] 本回合未压制住对手。',
      `[消耗] 你的体力 -${staminaLoss}。`,
    ]);

    if (nextStamina <= 0) {
      setTimeout(() => {
        setGameState('menu');
        setCurrentLoot(null);
        setLogs((prev) => [...prev, '[失败] 体力耗尽，被迫弃货撤离。']);
      }, 700);
      return;
    }

    if (action === 'flee' || nextRivalPressure <= 0) {
      setTimeout(() => {
        setGameState('retreat');
        setLogs((prev) => [...prev, '[系统] 已脱离争抢，进入撤离选择阶段。']);
      }, 700);
    }
  };

  const handleRetreat = (method: ExtractMethod) => {
    if (!currentLoot) return;

    const config = {
      street: { rate: 0.85, fee: 0, label: '主街撤离' },
      courier: { rate: 0.95, fee: 160, label: '同城闪送代运' },
      alley: { rate: 0.62, fee: 0, label: '后巷小路' },
    }[method];

    if (currentLoot.value < config.fee) {
      setLogs((prev) => [...prev, `[撤离失败] ${config.label}成本 ${config.fee}，本次货值不足。`]);
      return;
    }

    const success = Math.random() < config.rate;
    if (success) {
      const lootAfterFee = { ...currentLoot, value: Math.max(1, currentLoot.value - config.fee) };
      setInventory((prev) => [...prev, lootAfterFee]);
      setBagLoad((prev) => Math.min(100, prev + 25));
      setLogs((prev) => [...prev, `[成功] ${config.label}成功，入库 ${lootAfterFee.name}。`]);
    } else {
      setLogs((prev) => [...prev, `[失败] ${config.label}被截停，战利品遗失。`]);
    }

    setGameState('collection');
    setCurrentLoot(null);
  };

  const viewCollection = () => setGameState('collection');

  const backToMenu = () => {
    setGameState('menu');
    setLogs([]);
    setCurrentLoot(null);
  };

  const inventoryValue = useMemo(() => inventory.reduce((sum, item) => sum + item.value, 0), [inventory]);
  const rareCount = useMemo(() => inventory.filter((item) => ['rare', 'epic', 'legendary'].includes(item.rarity)).length, [inventory]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative cyber-bg">
      <div className="scan-line fixed top-0 left-0 right-0 h-1 pointer-events-none z-50" />
      <div className="fixed inset-0 opacity-15 pointer-events-none cyber-grid" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="border-b border-primary/30 bg-background/70 backdrop-blur-md p-4">
          <div className="max-w-6xl mx-auto flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold neon-glow" style={{ fontFamily: "'Orbitron', monospace" }}>
                城市夜市：摸金纪元
              </h1>
              <p className="text-xs text-muted-foreground mt-1">搜 · 争 · 撤 | 近现实在线收藏对抗</p>
            </div>
            <div className="glass-chip text-right">
              <p className="text-[11px] text-muted-foreground">仓库估值</p>
              <p className="text-xs text-accent font-semibold">{inventoryValue} CR</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-primary/15 bg-background/50">
          <div className="max-w-6xl mx-auto grid grid-cols-4 gap-2 text-[11px]">
            <div className="glass-chip"><span>体力</span><b>{stamina}%</b></div>
            <div className="glass-chip"><span>专注</span><b>{focus}%</b></div>
            <div className="glass-chip"><span>热度</span><b>{heat}%</b></div>
            <div className="glass-chip"><span>负载</span><b>{bagLoad}%</b></div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            {gameState === 'menu' && (
              <Card className="cyber-border p-6 md:p-8 text-center space-y-5 bg-card/70">
                <div className="text-4xl md:text-5xl font-bold neon-glow" style={{ fontFamily: "'Orbitron', monospace" }}>
                  NIGHT BAZAAR
                </div>
                <p className="text-foreground/80">
                  你是城市寻物师。今晚在夜市、旧仓和后巷捡漏，带货回仓才算赢。
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="glass-chip flex-col"><Crosshair size={14} /><span>搜摊位</span></div>
                  <div className="glass-chip flex-col"><Skull size={14} /><span>争货权</span></div>
                  <div className="glass-chip flex-col"><DoorOpen size={14} /><span>撤入库</span></div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={startExploring}
                    className="w-full bg-primary hover:bg-primary/80 text-background font-bold text-lg py-6"
                  >
                    <Zap className="mr-2" /> 今晚开张
                  </Button>
                  <Button
                    onClick={viewCollection}
                    variant="outline"
                    className="w-full cyber-border-cyan text-accent font-bold"
                  >
                    <Gem className="mr-2" /> 查看收藏 ({inventory.length})
                  </Button>
                </div>
              </Card>
            )}

            {gameState === 'search' && (
              <Card className="cyber-border p-6 md:p-8 space-y-6 bg-card/70">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold neon-glow mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>
                    [搜] 捡漏阶段
                  </div>
                  <p className="text-foreground/80 text-sm">拍照比价、问价套话、翻箱找货。每次搜索都在抬高被盯上的风险。</p>
                </div>

                <div className="bg-card/50 border border-primary/20 p-4 rounded-sm space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>体力</span>
                    <div className="flex-1 mx-4 bg-background h-2 border border-primary/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${stamina}%` }}
                      />
                    </div>
                    <span className="neon-glow">{stamina}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>专注</span>
                    <div className="flex-1 mx-4 bg-background h-2 border border-accent/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all"
                        style={{ width: `${focus}%` }}
                      />
                    </div>
                    <span className="neon-glow-cyan">{focus}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-accent hover:bg-accent/80 text-background font-bold py-4"
                  >
                    <Camera className="mr-2" /> 搜一个摊位（-15 专注）
                  </Button>
                  <Button
                    onClick={() => setGameState('menu')}
                    variant="outline"
                    className="w-full cyber-border text-foreground"
                  >
                    返回菜单
                  </Button>
                </div>
              </Card>
            )}

            {gameState === 'fight' && (
              <Card className="cyber-border-pink p-6 md:p-8 space-y-6 bg-card/70">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold neon-glow-pink mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>
                    [争] 争抢阶段
                  </div>
                  <p className="text-foreground/80 text-sm">有人来截胡你的货。压住对手，或者及时抽身。</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-card/50 border border-secondary/20 p-4 rounded-sm">
                    <p className="text-xs text-muted-foreground mb-2">你</p>
                    <p className="text-2xl font-bold neon-glow">{stamina}%</p>
                  </div>
                  <div className="bg-card/50 border border-secondary/20 p-4 rounded-sm">
                    <p className="text-xs text-muted-foreground mb-2">对手压力</p>
                    <p className="text-2xl font-bold neon-glow-pink">{Math.max(0, rivalPressure)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleFight('attack')}
                    className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3"
                  >
                    <Skull className="mr-2" /> 抬价压制
                  </Button>
                  <Button
                    onClick={() => handleFight('defend')}
                    variant="outline"
                    className="w-full cyber-border-cyan text-accent font-bold py-3"
                  >
                    <Shield className="mr-2" /> 护货防守
                  </Button>
                  <Button
                    onClick={() => handleFight('flee')}
                    variant="outline"
                    className="w-full cyber-border text-foreground font-bold py-3"
                  >
                    撤出抢点
                  </Button>
                </div>
              </Card>
            )}

            {gameState === 'retreat' && (
              <Card className="cyber-border p-6 md:p-8 space-y-6 bg-card/70">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold neon-glow mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>
                    [撤] 撤离阶段
                  </div>
                  <p className="text-foreground/80 text-sm">撤离不是结束，是收益兑现。你要选稳，还是赌。</p>
                </div>

                {currentLoot && (
                  <div className="bg-card/50 border border-primary/30 p-6 rounded-sm space-y-3">
                    <p className="text-sm text-muted-foreground">获得战利品</p>
                    <div className="text-3xl">{currentLoot.icon}</div>
                    <p className="text-xl font-bold neon-glow">{currentLoot.name}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">稀有度</span>
                      <span className={RARITY_CLASS[currentLoot.rarity]}>{RARITY_LABEL[currentLoot.rarity]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">价值</span>
                      <span className="neon-glow-pink">{currentLoot.value} 信用点</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button onClick={() => handleRetreat('street')} className="w-full bg-primary hover:bg-primary/80 text-background font-bold py-3">
                    <DoorOpen className="mr-2" /> 主街撤离（85%）
                  </Button>
                  <Button onClick={() => handleRetreat('courier')} variant="outline" className="w-full cyber-border-cyan text-accent font-bold py-3">
                    <Timer className="mr-2" /> 同城闪送代运（95%，160费用）
                  </Button>
                  <Button onClick={() => handleRetreat('alley')} variant="outline" className="w-full cyber-border-pink text-secondary font-bold py-3">
                    <Backpack className="mr-2" /> 后巷小路（62%，零成本）
                  </Button>
                </div>
              </Card>
            )}

            {gameState === 'collection' && (
              <Card className="cyber-border p-6 md:p-8 space-y-6 bg-card/70">
                <div className="text-center">
                  <div className="text-3xl font-bold neon-glow mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>
                    📦 我的收藏
                  </div>
                  <p className="text-foreground/80">已收集 {inventory.length} 件物品</p>
                </div>

                {inventory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    还没有收藏任何物品。开始探险吧！
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {inventory.map((item, idx) => (
                      <div key={`${item.name}-${idx}`} className="bg-card/50 border border-primary/20 p-4 rounded-sm">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <p className="font-bold text-sm neon-glow">{item.name}</p>
                        <p className={`text-xs mt-1 ${RARITY_CLASS[item.rarity]}`}>{RARITY_LABEL[item.rarity]}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{item.district}</p>
                        <p className="text-xs neon-glow-pink mt-2">{item.value} ⚡</p>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={backToMenu}
                  className="w-full bg-primary hover:bg-primary/80 text-background font-bold py-4"
                >
                  返回菜单
                </Button>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="cyber-border p-4 h-[320px] md:h-96 overflow-hidden flex flex-col bg-card/70">
              <h3 className="text-sm font-bold neon-glow mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>系统日志</h3>
              <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">[系统] 就绪</p>
                ) : (
                  logs.map((log, idx) => (
                    <p key={idx} className="text-foreground/80 break-words">
                      {log}
                    </p>
                  ))
                )}
              </div>
            </Card>

            <Card className="cyber-border-cyan p-4 space-y-3 bg-card/70">
              <h3 className="text-sm font-bold neon-glow-cyan" style={{ fontFamily: "'Orbitron', monospace" }}>回合数据</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">总收藏品</span>
                  <span className="neon-glow">{inventory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">总价值</span>
                  <span className="neon-glow-pink">{inventoryValue} ⚡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">稀有物品</span>
                  <span className="text-accent">{rareCount}</span>
                </div>
              </div>
            </Card>

            <Card className="cyber-border-pink p-4 space-y-2 bg-card/70">
              <h3 className="text-sm font-bold neon-glow-pink" style={{ fontFamily: "'Orbitron', monospace" }}>💡 提示</h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                {gameState === 'menu' && '先学会稳撤，再追求高价值捡漏。'}
                {gameState === 'search' && '连续搜索会抬高热度，热度越高越容易被截胡。'}
                {gameState === 'fight' && '防守更稳，攻击更快，撤出最保命。'}
                {gameState === 'retreat' && '高成功率路线通常伴随额外成本。'}
                {gameState === 'collection' && '每件藏品都记录来源区域，可用于后续套装与任务。'}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
