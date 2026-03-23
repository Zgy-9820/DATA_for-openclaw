---
name: aeolus-link-analysis
description: |
  解析 Aeolus / 风神数据查询链接、看板链接、查询页面、SQL 逻辑与指标口径时使用。用户提到“风神/Aeolus 看板链接解析”“数据查询解析”“Query ID/SQL Details/指标口径/维度指标过滤条件”时触发。
---

# Aeolus / 风神看板链接解析

当用户要求你解析 Aeolus / 风神的数据查询链接、看板页面、查询逻辑、SQL、指标口径时，使用本技能。

## 目标

把一个风神链接尽量还原成以下几层信息：
1. 查询身份：这是谁、哪张模板、哪个快照、哪个业务应用
2. 模板/元数据：底层数据集、指标、维度、过滤条件、版本信息
3. SQL / 表达式逻辑：真实执行逻辑或可替代的 expr/fullExpr
4. 业务口径：这些字段和指标在业务上到底是什么意思
5. 风险点：口径歧义、过滤缺失、未去重、空值处理等问题

## 执行原则

### 原则 1：先抓“查询身份”，不要一上来只靠点 UI
优先从链接中提取 `id`、`sid`、`appId`、`extra` 等参数。
- `id` 默认先视为 **Query ID / 输入查询标识**
- `sid` 用来锁定快照/版本
- `appId` 用来判断所属业务应用
- `extra` 等编码参数先解码，再提取主键、模板键、快照信息

默认先做 **Link Fingerprinting → 结构化函数 → 状态树 / 底层接口**。**看板解析必须按照 Link Fingerprinting 思路执行，这不是建议项，而是强制主链路。** UI 点击**只能作为结构化解析过程中的辅助确认动作**，**任何时候都不允许把纯 UI 点击路径当作解析路径，更不允许只靠点页面面板、筛选器、SQL 详情、查询历史来完成解析。** 也不能跳过 Link Fingerprinting 直接开始页面内解析。

### 原则 2：页面接管后，优先读“结构化函数 / 状态树 / 底层接口”，必要时辅以 UI
优先把页面当成一个“已登录、已加载上下文的运行环境”，直接在页面上下文执行 JS，寻找前端已经挂出的内部函数、状态树和结构化结果。

**固定优先级：**
1. 页面内部结构化函数
   - `getReportInfoForllmForVizQuery()`
   - `getDataQueryDatasetForAgent()`
2. 页面状态 / store / schema / component state
3. 后台元数据 / SQL 接口
4. UI 交互（用于辅助确认筛选值、字段映射、查询配置，或在前 3 条拿不到完整信息时补洞）

如果能获取后台模板或元数据，优先查：
- `dataset_id`
- `metrics`
- `dimensions`
- `filters`
- `sqlList / script_content / sql / source_sql / aeolusFullExpr / fullExpr`
- `datasource_config`
- `version_info`
- `columns / schema / vizData / queryHistoryId`

解释业务含义时，优先用模板配置；验证执行逻辑时，再对照 SQL。

### 原则 3：优先通过 Query ID / Query History ID + 底层接口直取 full SQL；拿不到再退化到表达式
SQL 获取优先级：
1. Link Fingerprinting → 提取 `appId`、输入链接里的 `id`、`sid`、`reportQuerySchemaKey`
2. 页面打开后，第一时间调用页面结构化函数，优先尝试 `getReportInfoForllmForVizQuery()` 与 `getDataQueryDatasetForAgent()`
3. 从 `getReportInfoForllmForVizQuery()` 的返回结果里确认真实可用的 `queryHistoryId`
4. **相关指纹 ID 必须严格以用户发来的原始链接为起点进行查询与追踪。默认以原始链接中的 `id` / `sid` / `appId` / `reportQuerySchemaKey` 作为主指纹，不允许把页面重定向后的 URL 当成新的起点来替代原始指纹。** 如果后续结构化函数返回了新的 `queryHistoryId`，可以把它记录为“派生出的真实执行 ID / 候选执行 ID”，用于补充说明、交叉验证或后续接口尝试；但**不得覆盖、替换、遗忘用户原始链接中的指纹 ID**，文档与说明里必须明确区分“原始链接指纹 ID”与“页面加载后派生 ID”。
5. 直接尝试后台 SQL 接口 `/api/v3/misc/sql`，优先传 `queryHistoryId + detail=true`
6. 优先从返回 JSON 的 `data.sql` 获取完整 SQL；其次看 `data.query_logic.full_sql`
7. 若 SQL 接口不可用，再走页面状态树 / 元数据接口 / `expr/fullExpr/aeolusFullExpr`
8. 如前述路径无法完整拿到信息，可进入页面中的“查询历史 / SQL Details / 其他 UI 面板”补充确认；但仍优先保留结构化 / 接口结果作为主证据

如果拿不到官方 full SQL，不要卡住；直接提取指标、维度、筛选条件的 `expr / fullExpr / aeolusFullExpr / formula`，照样还原逻辑。

#### 本次验证过的最优 SQL 执行链路（默认优先采用）
1. **Link Fingerprinting**：先从用户发来的 Aeolus 链接提取 `appId / id / sid / reportQuerySchemaKey`，并将其视为本次解析的**唯一主指纹起点**
2. **原始指纹优先**：后续所有查询、说明、文档都必须先围绕原始链接中的这些指纹展开；即使页面加载后出现新的 `queryHistoryId`，也只能作为“派生 ID / 执行态 ID”补充记录，**不能替代原始链接指纹**
3. **托管打开页面**：直接打开页面，但默认只把页面当作补充结构化信息的运行环境，而不是新的指纹来源
4. **结构化函数取主干**：执行 `getReportInfoForllmForVizQuery()`
   - 拿 `queryHistoryId`
   - 拿 `sqlList`
   - 拿 `reqJson.query.whereList`
   - 拿 `metaData.dataSetId / dataSetName`
   - 拿 `vizData`
5. **结构化函数取字段元数据**：执行 `getDataQueryDatasetForAgent()`
   - 拿 `dimensionList`
   - 拿 `metricsList`
   - 拿字段的 `expr / fullExpr / displayName`
6. **SQL 接口尝试顺序**：
   - 优先围绕**原始链接指纹 ID** 尝试可用的查询与定位路径
   - 若结构化函数提供了新的 `queryHistoryId`，可将其作为补充尝试项调用 `/api/v3/misc/sql?queryHistoryId=<派生queryHistoryId>&detail=true`
7. **SQL 提取优先级**：
   - 首选：基于原始链接指纹定位到的官方 SQL 结果
   - 次选：接口返回 JSON 的 `data.sql`
   - 再次选：接口返回 JSON 的 `data.query_logic.full_sql`
   - 再次选：`getReportInfoForllmForVizQuery().sqlList`
8. **字段映射与递归展开**：
   - 用 `getDataQueryDatasetForAgent()` 的 `dimensionList / metricsList` 把页面字段、字段 ID、`expr/fullExpr` 对齐
   - 对 `[xxx]`、alias、派生字段继续递归展开
9. **结果值校验**：
   - 用 `vizData` 校验页面结果值与 SQL / 指标口径是否一致

默认把以上链路视为 Aeolus 链接解析时的**最优执行链路**；除非遇到页面函数失效、权限拦截或接口不可用，否则不要退化成“先点 UI、再找 SQL 面板”的低优先路径。

#### 次优选的最佳实践参考（当最优链路未完全收敛时）
如果当次任务里已经能托管打开页面，但还没有完全打通“原始指纹 → 结构化函数 → full SQL”的最优闭环，可按下面这套**次优选最佳实践**推进，用于快速定位卡点、提高成功率：

1. **先固定原始链接指纹，不被页面改写带偏**
   - 在任何页面操作前，先从用户原始链接提取并记录：`appId`、`id`、`sid`、`reportQuerySchemaKey`
   - 后续即使页面把 URL 中的 `id` 改写成新的值，也只能把新值记录为“页面派生执行 ID / queryHistoryId”，不能覆盖原始指纹

2. **把页面当运行环境，不把页面 URL 当事实源**
   - 页面加载后，优先读取页面内部函数、状态树、结构化结果
   - 不要因为页面地址栏发生变化，就直接认定新的 URL 参数是新的主查询身份

3. **优先验证页面结构化函数是否存在**
   - 先检查：
     - `getReportInfoForllmForVizQuery()`
     - `getDataQueryDatasetForAgent()`
   - 只要函数还在，就优先直接调用，而不是先去点 UI 面板

4. **先拿 `getReportInfoForllmForVizQuery()` 的主干，再决定是否继续补接口**
   - 优先取：
     - `queryHistoryId`
     - `sqlList`
     - `reqJson.query.whereList`
     - `metaData.dataSetId / dataSetName`
     - `columns`
     - `vizData`
   - 如果 `sqlList` 已经给出完整 SQL，可先完成主要解析，不必执着于必须再命中额外 SQL 面板或额外接口

5. **再用 `getDataQueryDatasetForAgent()` 建字段映射闭环**
   - 重点拿：
     - `dimensionList`
     - `metricsList`
   - 用于建立：页面中文字段名 ↔ 字段 ID ↔ `expr/fullExpr` ↔ SQL 列/别名 的对应关系
   - 如果只拿到 SQL、没拿到字段元数据，通常很难完成高质量口径翻译，这时优先补字段元数据，而不是优先去补更多 UI 截图信息

6. **递归展开指标，不停留在中间层名称**
   - 如页面显示的是：`[智能解决会话量] / [智能参评会话量]`
   - 必须继续下钻，把它展开成最终的 `CASE WHEN + count(distinct ...)`
   - 不要把中间层指标名直接当作最终口径解释

7. **用 `vizData` 做结果校验，避免只讲逻辑不对数**
   - 若已拿到 `vizData.datasets`，默认用它校验页面结果值是否与 SQL/指标逻辑一致
   - 这一步能显著降低“SQL 解释对了，但结果没对上页面”的风险

8. **当次优链路也能交付时，要明确说明它为何是次优选**
   - 例如：本次虽未额外命中 `/api/v3/misc/sql`，但已从 `sqlList` 拿到完整 SQL，且字段映射与 `vizData` 校验已闭环，因此可完成高置信度解析
   - 文档或说明里可标注：这是“结构化函数命中、SQL 已由页面返回”的成功路径，属于次优选最佳实践，不等于放弃最优链路

这套次优选最佳实践的核心思想是：**当最优链路暂时没完全打通时，优先把“原始指纹保真 + 结构化函数直读 + 字段映射闭环 + 结果校验”做完整，而不是退回纯 UI 点击路径。纯 UI 点击路径不属于可接受方案，任何时候都不能作为完成解析的手段。**

### 原则 4：网页接管默认全流程托管，但默认走“非 UI 路径”
涉及网页操作时，默认采用**全流程托管**，目标是：**不需要额外征求用户确认，持续接管直到定位到查询结果、SQL、元数据或明确受阻点**。

### 原则 4.1：当用户要求“把执行过程打印到托管页面”时，必须在页面内持续输出进度日志
如果用户明确要求把执行过程打印到托管页面、页面日志里、托管页中，默认在当前托管页面里注入一个轻量日志面板（或等价的页面内日志容器），把关键步骤实时打印出来。

默认打印的步骤包括：
1. Link Fingerprinting 开始 / 提取到的 `appId / id / sid`
2. 页面加载完成
3. 尝试调用 `getReportInfoForllmForVizQuery()`
4. 尝试调用 `getDataQueryDatasetForAgent()`
5. 确认真实 `queryHistoryId`
6. 调用 `/api/v3/misc/sql?queryHistoryId=...&detail=true`
7. SQL 命中来源（`data.sql` / `data.query_logic.full_sql` / `sqlList` / `expr/fullExpr`）
8. 开始字段映射与递归展开
9. 开始结果值校验
10. 解析完成 / 遇阻原因

要求：
- 页面日志要尽量简洁，可读，按步骤追加，不要刷屏
- 日志内容以执行进度为主，不要把超长 SQL 全量灌到页面日志面板里；长 SQL 只打印“已获取”与来源，完整内容仍写文档
- 如果页面环境不允许注入日志面板，则退化为 `console.log`，并在对话里说明已退化到控制台日志
- 若用户没有明确要求，则不必默认把全过程打印到托管页面

执行顺序：
- **默认不要使用 Browser Relay / Chrome 扩展 attach tab**；收到 Aeolus / 风神看板链接时，优先直接使用可用浏览器控制方式托管打开页面并继续解析
- 一旦可接管页面，默认执行顺序是：**打开目标页 → 等待加载 → 提取指纹 → 调结构化函数 / 状态树 → 调底层接口 → 抓取 SQL / 元数据 → 整理结果**
- **不要默认把“展开查询历史 / 定位 SQL Details / 点开筛选器”当成主路径**；这些动作只能用于结构化结果的辅助确认，**任何时候都不允许把它们升级为纯 UI 解析路径，也不允许把 UI 兜底当成可接受交付路径**
- **默认不要因为“是否继续操作网页”这类中间步骤停下来征求确认**；只要任务目标还是“解析该链接”，就持续做下去直到拿到结果
- 如遇 SSO，优先尝试页面中间的「Lark/飞书登录」按钮或其他明显登录入口
- 如出现二维码、系统级授权弹窗等必须由用户完成的外部动作，才暂停并把最小必要动作发给用户处理；处理后立即继续
- 只有在用户明确指定要用 Relay / attach tab 时，才改用 Browser Relay

## 标准执行流程

### 第一阶段：链接指纹提取
先解析 URL，整理出：
- `appId`
- `id`
- `sid`
- `extra` 或其他编码参数

输出一段“链接指纹摘要”，说明：
- 业务应用是谁
- Query ID 是什么
- Snapshot ID 是什么
- 是否存在额外编码信息

### 第二阶段：模板 / 元数据定位
先按链接身份类型分流，再围绕主指纹去找模板、元数据与配置：

- **query 型链接**：围绕原始 `id` 去找查询模板、后台元数据、配置中心信息
- **report 型链接**：围绕原始 `rid + sid` 去找报表模板、后台元数据、配置中心信息

重点确认：
- 底层数据集 / 库表
- 指标定义
- 维度定义
- 默认过滤条件
- 数据源类型（Hive / ClickHouse / MySQL 等）
- 版本信息、变更人、变更时间

若出现 SQL 中的 `_col_xxx` 之类字段，优先回查模板中的真实指标名与定义。

### report（rid）型链接标准 SOP
当原始链接包含 `rid=` 且不包含原始 `id=` 时，默认按下面 SOP 执行：

1. **固定主指纹**
   - 提取并记录：`appId`、`rid`、`sid`
   - 文档中明确标注：这是 **report 型链接**，主身份使用 `rid + sid`

2. **页面只作为运行环境**
   - 托管打开页面后，不依赖地址栏变化判断主身份
   - 若后续拿到 `queryHistoryId`，只能作为页面派生执行 ID 记录

3. **优先调用结构化函数拿主干**
   - `getReportInfoForllmForVizQuery()`：优先拿
     - `metaData.reportId / reportName`
     - `metaData.dataSetId / dataSetName`
     - `queryHistoryId`
     - `sqlList`
     - `reqJson.query.whereList`
     - `columns`
     - `vizData`
   - `getDataQueryDatasetForAgent()`：优先拿
     - `dimensionList`
     - `metricsList`

4. **从 `whereList` 还原过滤逻辑**
   - 重点识别：
     - 时间条件（如 `last` / `lastSync`）
     - 枚举筛选（如 `in (...)`）
     - 业务标签类过滤
   - 再与 SQL WHERE 对齐，得到最终可读筛选逻辑

5. **从 `sqlList` 确认真实指标表达式**
   - 不停留在页面指标名，必须找到：
     - 真实分子
     - 真实分母
     - 实际去重主键
   - 若 `sqlList` 已给完整 SQL，可直接作为主 SQL 来源

6. **用元数据做字段映射与递归展开**
   - 用 `dimensionList / metricsList / columns` 确认：
     - 页面维度 ↔ 原始表达式
     - 页面指标 ↔ `expr/fullExpr`
   - 如果是派生指标（如 `[A]/[B]`），继续递归下钻到最终 SQL 逻辑

7. **单独识别关键口径风险**
   - 特别关注：
     - 是否使用 `concat(...)` 作为统计主键
     - 分母是否为“参评量 / 诊断量 / 服务量”而非总量
     - 是否存在“业务时间 + 分区时间”的双层过滤

8. **结果校验并输出**
   - 用 `vizData.datasets` 对齐页面结果值
   - 按标准模板输出到飞书文档

一句话概括这套 report 型 SOP：
**先识别 `rid` 型身份 → 直读页面结构化函数 → 从 `whereList + sqlList + vizData` 拿主干 → 用数据集元数据补字段映射 → 递归展开指标 → 输出标准文档。**

### query（id）型链接标准 SOP
当原始链接包含 `id=` 时，默认按下面 SOP 执行：

1. **固定主指纹**
   - 提取并记录：`appId`、`id`、`sid`、`reportQuerySchemaKey`（如果有）
   - 文档中明确标注：这是 **query 型链接**，主身份使用原始 `id`（及其关联 `sid/appId`）

2. **页面只作为运行环境**
   - 托管打开页面后，不依赖地址栏变化判断主身份
   - 如果页面把 `id` 改写成新的值，或结构化函数返回新的 `queryHistoryId`，只能记录为页面派生执行 ID

3. **优先调用结构化函数拿主干**
   - `getReportInfoForllmForVizQuery()`：优先拿
     - `queryHistoryId`
     - `sqlList`
     - `reqJson.query.whereList`
     - `metaData.dataSetId / dataSetName`
     - `columns`
     - `vizData`
   - `getDataQueryDatasetForAgent()`：优先拿
     - `dimensionList`
     - `metricsList`

4. **优先围绕原始指纹和 `queryHistoryId` 补 full SQL**
   - 先保留原始 `id` 为主追踪身份
   - 如果结构化函数给出 `queryHistoryId`，优先尝试：
     - `/api/v3/misc/sql?queryHistoryId=<...>&detail=true`
   - SQL 来源优先级：
     1. `data.sql`
     2. `data.query_logic.full_sql`
     3. `sqlList`

5. **从 `whereList` 还原过滤逻辑**
   - 逐项识别时间条件、枚举条件、CASE 过滤、派生条件
   - 再与 SQL WHERE 对齐，得到最终可读逻辑

6. **用元数据做字段映射与递归展开**
   - 用 `dimensionList / metricsList / columns` 确认页面字段和底层表达式对应关系
   - 如果是派生指标（如 `[A]/[B]`、alias、`_col_xxx`），继续递归下钻到最终 SQL 逻辑

7. **识别口径风险并校验结果**
   - 重点关注：
     - 多渠道条件分支是否不同
     - 分子分母是否使用不同主键/不同过滤
     - 是否存在页面原始 `id` 与页面派生执行 ID 不一致
   - 用 `vizData.datasets` 做结果校验

8. **输出文档**
   - 按标准模板输出到飞书文档，并明确区分：
     - 原始链接指纹 ID
     - 页面派生执行 ID / `queryHistoryId`

一句话概括这套 query 型 SOP：
**先识别原始 `id` 型身份 → 直读结构化函数 → 用 `queryHistoryId` 补 full SQL → 还原 where / 字段映射 / 指标递归展开 → 校验结果 → 输出标准文档。**

### 第三阶段：数据集可信度扫描
如果能拿到数据集信息，再补充：
- 数据总行数 / 存储大小
- 最近同步时间
- 数据是否实时或 T+1
- 血缘关系：原始明细、DWS、ADS 还是聚合层

### 第四阶段：页面内执行 JS，抓查询主干（默认只走结构化路径）
在页面上下文里优先尝试：
- `getReportInfoForllmForVizQuery()`：优先拿 `sqlList`、`whereList`、`dimMetList`、`schema`、`columns`、`vizData`、`queryHistoryId`
- `getDataQueryDatasetForAgent()`：优先拿字段 `expr / fullExpr / displayName / fieldList`

目标不是只看页面展示，而是直接拿结构化结果：
- `sqlList` 用于获取真实执行 SQL
- `whereList` 用于还原筛选条件
- `dimMetList / schema / columns` 用于建立“字段 ID ↔ 中文名 ↔ SQL 列”映射
- `vizData` 用于验证结果值和字段展示
- `datasetInfo.dimensionList` 用于解释派生字段与 CASE WHEN 逻辑

如果页面函数不可用，再按优先级查看：
- `queryInfos`
- `report`
- `schema / schemas`
- `componentTree / componentStates`
- `dataSets`
- `window.state / window.actions / store / redux / mobx`

然后拆解：
- 维度：`CASE WHEN`、`IF`、日期转换、渠道归类、异常值剔除
- 原子指标：`COUNT(DISTINCT ...)`、`SUM(...)` 等
- 复合指标：分子、分母、比例逻辑、硬编码条件
- 全局过滤：时间分区、业务过滤条件、appId 限制等

注意：URL 中的 `id` 不一定等于最终可用于 SQL 接口的后端主键。必要时继续从**结构化函数返回值、状态树、元数据 JSON**里找真实映射对象。**不要优先通过点击页面 UI 来确认。**

### 第五阶段：建立字段映射、递归展开派生字段并翻译业务口径
优先建立以下映射关系：
- 页面字段名 ↔ 字段 ID
- 字段 ID ↔ SQL 列 / `_col_xxx`
- 中文业务名 ↔ `expr / fullExpr`

如果出现以下中间层引用，必须继续递归下钻，尽量展开到底：
- `[xxx]` 形式的派生字段引用
- `_col_xxx` / alias / 中间列名
- 指标或筛选中再次引用其他派生字段

默认要求：
- **不要停留在 `[仲裁判定方式]` 这类中间层字段名**
- **优先把引用字段继续展开成最终 `CASE WHEN` / `IF` / 原始字段表达式`**
- 若仍无法完全展开，要明确标注“未能继续展开的字段名、原因、已尝试路径”

然后把技术逻辑翻译成业务语言，例如：
- 字段代表什么业务动作
- 指标的分子/分母分别是什么
- “解决率”到底是解决量/评价量，还是解决量/进线量
- 条件如 `is_appraise = '1'` 代表的是哪类口径
- 哪些筛选是原始字段，哪些筛选是派生字段

### 第六阶段：结果输出
默认采用“两段式交付”：

#### 第一段：对话框先做简洁总结
先在当前对话里给用户一个可快速消费的总结，至少包含：
1. **查询身份**
   - appId / Query ID / Snapshot ID / 页面类型
2. **核心结论**
   - 这条查询在看什么
   - 关键维度、关键指标、关键筛选
3. **风险提醒**
   - 1~5 条最值得注意的口径风险

#### 第二段：详细结果写入飞书文档并发送链接
再把完整结果整理成飞书文档，默认结构如下：
1. **查询身份**
   - 默认贴入：**用户发来的原始看板链接**（即本次解析的链接）
   - 查询身份中的相关指纹 ID（如 `id / sid / appId / reportQuerySchemaKey`）**必须严格以用户原始链接为准**
   - 如果页面加载后出现新的 `queryHistoryId` 或其他派生 ID，必须单独标注为“派生执行 ID / 页面返回 ID”，不得混写成原始指纹
   - 默认不再额外贴“底层数据集链接”，除非用户单独要求
2. **一句话结论**
3. **维度 SQL 逻辑表**
4. **指标 SQL 逻辑表**
5. **筛选项 SQL 逻辑表**
6. **关键派生字段递归展开**（如果存在 `[xxx]` / 中间层引用则必写）
7. **合并后的 WHERE 逻辑**
8. **原始 SQL / 伪 SQL**
   - **8.1 页面返回的原始 SQL**（重点保留，优先写入文档）
   - **8.2 可读版伪 SQL**（在不丢口径的前提下帮助用户阅读）
9. **结果值**
10. **风险点**

表格优先使用以下列：
- 维度表：`维度名称 | 页面字段 | 原始表达式 | 分组 SQL 逻辑 | 业务解释`
- 指标表：`指标名称 | SQL 逻辑 | 业务口径解释`
- 筛选表：`筛选项 | 页面字段 | 配置方式 | SQL 逻辑 | 业务解释`

写文档时的 SQL 规则：
- **优先写最原始、最完整的 SQL 逻辑，不要为了可读性省略关键 CASE WHEN / IF 分支**
- **维度、指标、筛选项中的 SQL 逻辑默认都不允许写成 `...`**；必要时必须补齐递归展开后的完整 SQL / 完整表达式
- **如果某个维度、指标、筛选项引用了派生字段、中间字段、`[xxx]`、alias 或 `_col_xxx`，默认继续递归展开，直到文档里能看到最终完整逻辑**
- **默认重点保留“8.1 页面返回的原始 SQL”**，这是文档里的核心内容，不要省掉
- **同时提供“8.2 可读版伪 SQL”**，帮助快速理解口径，但不能替代原始 SQL
- 除非用户明确要求精简，否则不要用 `...` 省略复杂逻辑；如果因为长度问题必须分段，应该拆到第 6 节或附加小节里完整展开，而不是省略
- 如果文档正文过长，可增加“关键派生字段递归展开”章节承载完整 SQL，而不是删减逻辑

必要时补充：
- “页面指标名 vs SQL 实际逻辑 vs 业务解释”的对比表
- “原始字段筛选 vs 派生字段筛选”的拆解
- 结果值校验（用 `vizData` 或结果集反查是否与 SQL/口径一致）

## 固定文档模板（已标准化）
后续所有 Aeolus / 风神 / 看板链接解析，默认按用户确认过的“标准文档格式”输出，参考样例文档：
- https://bytedance.sg.larkoffice.com/docx/UIOid9ITgoA18KxibM0lv3FmgPc

默认规范如下：
1. **必须有一句话结论**，放在第 2 节，直接概括“这条查询在看什么 + 核心口径是什么”
2. **维度、指标、筛选项必须用表格展示**，优先使用飞书表格（lark-table），但 **Markdown 表格也可以接受**；重点是 3/4/5/9 这几节必须以表格形式清晰、直观展示，不能退回普通列表/条目块冒充表格。
3. **结果值优先也用表格展示**，尤其是趋势表、多指标表、分组结果；飞书原生表格优先，但 Markdown 表格同样可接受，只要清晰直观。
4. **最终输出到飞书文档的所有信息，必须严格按照本 skill 的固定模板与章节顺序编排，不允许自行发挥、不允许擅自增删章节、不允许把应在表格里的内容改写成普通列表或散文段落**
5. **章节顺序固定为**：
   - 1. 查询身份
   - 2. 一句话结论
   - 3. 维度 SQL 逻辑表
   - 4. 指标 SQL 逻辑表
   - 5. 筛选项 SQL 逻辑表
   - 6. 关键派生字段递归展开
   - 7. 合并后的 WHERE 逻辑
   - 8. 原始 SQL / 伪 SQL
   - 9. 结果值
   - 10. 风险点
6. **第 3/4/5/9 节默认视为“表格章节”**：如果没有以表格形态落地（飞书原生表格或 Markdown 表格），就视为未按模板完成。
7. **第 3 节不要写冗长解释段落**，维度/指标/筛选的主逻辑统一放进表格里表达
8. **第 8.1 节保留页面返回的原始 SQL**，允许保留 `_col_xxx`、`table_x`、中间别名等原始结构，不要擅自“美化”掉原始骨架
9. **第 8.2 节补一版可读版伪 SQL**，用于帮助理解，但不能替代 8.1
10. **如果存在派生字段 / CASE WHEN / 中间引用**，放到第 6 节做递归展开
11. **查询身份里默认贴原始看板链接**；除非用户明确要求，否则不额外贴底层数据集链接
12. **对话框回复仍然保持简洁**：先给短结论，再附飞书文档链接；详细内容全部进文档
13. **写文档前必须做一次模板自检**：逐项确认 1~10 节齐全、3/4/5/9 已落为清晰表格（飞书原生表格或 Markdown 表格）、8.1/8.2 均存在；任一项不满足，都不能视为完成。
14. **飞书文档格式属于强约束，不是建议项**：后续只要输出飞书文档，就必须严格按本 skill 的章节顺序、表格要求、原始 SQL / 伪 SQL 分节要求执行；其中 3/4/5/9 节必须是清晰直观的表格展示，**不强制要求必须是原生 `<lark-table>`**，Markdown 表格同样满足要求。

## 行为偏好
- 默认按本技能执行，不需要用户重复提醒
- **默认优先路径：Link Fingerprinting → 页面结构化函数 → 状态树/store → 底层 SQL/元数据接口 → 表达式层；必要时可结合 UI 点击做辅助确认**
- 优先尝试拿原始 SQL，再做业务解释
- 默认持续自动化推进；只有在必须依赖用户完成扫码、系统授权等外部动作时才中断
- **默认直接托管，不要默认要求使用 Browser Relay / attach tab；只有用户明确要求 Relay / attach tab 时才切换。**
- 先自行尝试状态树抓取、接口穿透、结构化函数调用等替代路径，不要过早把操作转回给用户
- **默认不要只依赖页面 UI 点击来获取筛选值、SQL、查询历史；优先结合结构化路径，必要时 UI 只能做辅助确认。任何时候都不允许仅凭 UI 点击结果完成解析或交付。**
- 不要只复述页面文案，要尽量还原查询模板与真实逻辑
- **后续写文档时，维度 / 指标 / 筛选项的 SQL 逻辑默认不允许简写成 `...`，必要时补足递归展开后的完整 SQL。**
- 默认交付方式：**先在对话框总结，再把详细结果按结构化格式写入飞书文档，并把文档链接发给用户**
- **该交付方式视为强制要求，不是建议项**：后续每一次 Aeolus / 风神 / 看板链接解析，无论用户是否再次提醒，都必须默认执行“对话框简洁总结 + 飞书文档详细版 + 返回文档链接”的两段式输出；除非用户明确要求不要写文档，才可例外
- **对话框输出必须严格保持短格式**：只允许包含“查询身份 / 一句话结论 / 核心口径 / 风险提醒 / 文档链接（如已生成）”这类高度摘要信息；不得把大段 SQL、长篇递归展开、长表格、完整分析正文直接灌在对话框里
- **详细分析正文必须写入飞书文档，不得只在对话框中完成交付**
- 后续生成飞书文档时，默认对齐用户确认过的标准样式：**一句话结论 + 表格展示维度/指标/筛选/结果值 + 原始 SQL + 可读伪 SQL**
- **文档模板强制参考样式**：优先对齐用户提供的参考文档 `https://bytedance.sg.larkoffice.com/docx/HB2Qdu3dVoL9OkxlyQGlNCHZgT3` 的结构与表达方式；章节顺序优先使用：`1. 查询身份` → `2. 一句话结论` → `3. 维度 SQL 逻辑表` → `4. 指标 SQL 逻辑表` → `5. 筛选项 SQL 逻辑表` → `6. 关键派生字段递归展开` → `7. 合并后的 WHERE 逻辑` → `8. 原始 SQL / 伪 SQL` → `9. 结果值` → `10. 风险点`
- **飞书文档所有章节必须严格按照模板格式输出**：今后默认按用户模板格式输出文档；除非用户明确要求额外补充，才在不破坏主模板的前提下新增其他章节
- **口径逻辑表必须优先使用表格**：尤其是维度、指标、筛选项、结果值四类结构化内容，必须以表格展示；可以是飞书原生表格，也可以是 Markdown 表格。只有超长 SQL、CASE WHEN、伪 SQL、补充说明文字才使用代码块或普通段落
