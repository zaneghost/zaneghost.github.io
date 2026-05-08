# 项目逻辑图（交互 + 代码）

本文档基于当前代码实现整理，覆盖：

- 代码架构逻辑
- 交互状态流转
- 单局核心流程
- 云端 API + 本地兜底策略
- 关键状态和数据关系

---

## 1) 代码架构逻辑图

```mermaid
flowchart TD
  A[index.html] --> B[src/main.tsx]
  B --> C[App.tsx]
  C --> D[Router wouter]
  D --> E[pages/Home.tsx]
  D --> F[pages/NotFound.tsx]

  C --> G[ThemeProvider]
  C --> H[TooltipProvider]
  C --> I[Toaster]
  C --> J[ErrorBoundary]

  E --> K[lib/gameApi.ts]
  E --> L[components/ui/button.tsx]
  E --> M[components/ui/card.tsx]
  E --> N[index.css]

  K --> O{VITE_GAME_API_BASE_URL 是否存在?}
  O -->|是| P[调用云端 API /v1/raid/*]
  O -->|否或失败| Q[本地 mock 兜底生成结果]
```

---

## 2) 交互状态机（玩家视角）

```mermaid
stateDiagram-v2
  [*] --> menu
  menu --> search: 今晚开张
  menu --> collection: 查看收藏

  search --> fight: 搜索后遭遇争抢
  search --> retreat: 搜索后未遭遇争抢
  search --> search: 专注不足/继续搜索提示

  fight --> retreat: 对手压力归零 或 主动撤出
  fight --> menu: 体力耗尽(失败)

  retreat --> collection: 撤离结算(成功/失败都入结算页)

  collection --> menu: 返回菜单
```

---

## 3) 单局核心流程图（交互 + 代码）

```mermaid
flowchart TD
  A[开始一局 startExploring] --> B[重置资源: stamina/focus/heat/bagLoad]
  B --> C[进入 search]

  C --> D[点击 搜一个摊位 handleSearch]
  D --> E{focus >= 15?}
  E -->|否| E1[写日志: 专注不足]
  E -->|是| F[扣专注/体力, 增热度]
  F --> G[调用 searchLoot]

  G --> H{云端 API 可用?}
  H -->|是| I[返回 loot + encounterFight + rivalPressure]
  H -->|否/异常| J[使用 gameApi mock 返回同结构结果]

  I --> K{encounterFight?}
  J --> K
  K -->|是| L[进入 fight, 设置 rivalPressure]
  K -->|否| M[进入 retreat]

  L --> N[玩家动作 attack/defend/flee]
  N --> O[调用 fightRound]
  O --> P[扣体力/降对手压力/写日志]
  P --> Q{体力 <= 0?}
  Q -->|是| R[失败回 menu]
  Q -->|否| S{finished 或 对手压力<=0?}
  S -->|是| M
  S -->|否| L

  M --> T[选择撤离方式 street/courier/alley]
  T --> U[调用 retreatWithLoot]
  U --> V{success?}
  V -->|是| W[loot 入 inventory + 增 bagLoad]
  V -->|否| X[仅写失败日志]
  W --> Y[进入 collection]
  X --> Y
```

---

## 4) 代码职责分层图

```mermaid
flowchart LR
  UI[Home UI 渲染层] --> S[Home 状态层 useState/useMemo]
  S --> A1[行为函数\nstartExploring/handleSearch/handleFight/handleRetreat]
  A1 --> API[gameApi 接口层]
  API --> NET[云端请求 fetch]
  API --> MOCK[本地兜底逻辑]
  S --> LOG[日志系统 logs]
  S --> INV[库存系统 inventory/currentLoot]
```

---

## 5) 云端分发与安全逻辑图

```mermaid
flowchart TD
  C[客户端 Home.tsx] --> D[searchLoot/fightRound/retreatWithLoot]
  D --> E{配置了 API_BASE?}
  E -->|是| F[请求后端]
  E -->|否| G[本地 mock]

  F --> H[后端维护全量藏品库]
  H --> I[后端结算稀有分发/争抢/撤离]
  I --> J[仅下发本次必要数据]
  J --> C

  G --> C
```

---

## 6) 关键类型与状态清单

- `GameState`: `menu | search | fight | retreat | collection`
- 核心资源：`stamina`、`focus`、`heat`、`bagLoad`、`rivalPressure`
- 藏品结构：`Loot { id, name, rarity, value, icon, district }`
- API 返回结构：
  - `SearchResult`
  - `FightResult`
  - `RetreatResult`

