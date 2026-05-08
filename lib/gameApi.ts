export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type Loot = {
  id: string;
  name: string;
  rarity: Rarity;
  value: number;
  icon: string;
  district: string;
};

export type FightAction = "attack" | "defend" | "flee";
export type ExtractMethod = "street" | "courier" | "alley";

export type SearchResult = {
  loot: Loot;
  encounterFight: boolean;
  rivalPressure: number;
  logs: string[];
};

export type FightResult = {
  staminaLoss: number;
  rivalPressureLoss: number;
  moveLog: string;
  finished: boolean;
  logs: string[];
};

export type RetreatResult = {
  success: boolean;
  lootAfterFee: Loot | null;
  logs: string[];
};

const API_BASE = (import.meta.env.VITE_GAME_API_BASE_URL ?? "").replace(/\/$/, "");

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  if (!API_BASE) throw new Error("API base not configured");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createMockLoot(): Loot {
  const districts = ["南城夜市", "工业旧仓", "码头跳蚤场", "北环总站", "旧戏院仓库"];
  const prefixes = ["停产", "联名", "旧厂", "限定", "遗落", "手工改造"];
  const cores = ["磁带机", "黑胶", "门禁卡", "招牌灯", "主板", "徽章", "工位牌"];
  const icons = ["📼", "💿", "🪪", "💡", "🧩", "🏷️", "🪧"];
  const roll = Math.random();
  const rarity: Rarity =
    roll > 0.99 ? "legendary" : roll > 0.94 ? "epic" : roll > 0.78 ? "rare" : roll > 0.45 ? "uncommon" : "common";
  const valueBase = { common: 120, uncommon: 280, rare: 760, epic: 1800, legendary: 4200 }[rarity];

  return {
    id: `mock-${Date.now()}-${randomInt(1000, 9999)}`,
    name: `${pick(prefixes)}${pick(cores)}`,
    rarity,
    value: valueBase + randomInt(-50, 200),
    icon: pick(icons),
    district: pick(districts),
  };
}

export async function searchLoot(): Promise<SearchResult> {
  try {
    return await postJson<SearchResult>("/v1/raid/search", {});
  } catch {
    const loot = createMockLoot();
    const encounterFight = Math.random() > 0.42;
    return {
      loot,
      encounterFight,
      rivalPressure: randomInt(68, 95),
      logs: [
        `[发现] ${loot.district} 出现 ${loot.name}。`,
        encounterFight ? "[警告] 其他寻物师盯上你的货，发生争抢。" : "[系统] 目前无冲突，建议立刻规划撤离路线。",
      ],
    };
  }
}

export async function fightRound(action: FightAction): Promise<FightResult> {
  try {
    return await postJson<FightResult>("/v1/raid/fight", { action });
  } catch {
    const rivalPressureLoss = action === "attack" ? randomInt(18, 31) : action === "defend" ? 8 : 0;
    const staminaLoss = action === "defend" ? randomInt(6, 14) : randomInt(10, 23) + (action === "flee" ? 6 : 0);
    return {
      staminaLoss,
      rivalPressureLoss,
      moveLog:
        action === "attack" ? "强势抬价压制对手。" : action === "defend" ? "护住货箱拖时间。" : "趁乱钻巷脱身。",
      finished: action === "flee",
      logs: [],
    };
  }
}

export async function retreatWithLoot(method: ExtractMethod, loot: Loot): Promise<RetreatResult> {
  try {
    return await postJson<RetreatResult>("/v1/raid/retreat", { method, lootId: loot.id });
  } catch {
    const config = {
      street: { rate: 0.85, fee: 0, label: "主街撤离" },
      courier: { rate: 0.95, fee: 160, label: "同城闪送代运" },
      alley: { rate: 0.62, fee: 0, label: "后巷小路" },
    }[method];
    if (loot.value < config.fee) {
      return { success: false, lootAfterFee: null, logs: [`[撤离失败] ${config.label}成本 ${config.fee}，本次货值不足。`] };
    }
    const success = Math.random() < config.rate;
    if (!success) return { success: false, lootAfterFee: null, logs: [`[失败] ${config.label}被截停，战利品遗失。`] };
    return {
      success: true,
      lootAfterFee: { ...loot, value: Math.max(1, loot.value - config.fee) },
      logs: [`[成功] ${config.label}成功，入库 ${loot.name}。`],
    };
  }
}
