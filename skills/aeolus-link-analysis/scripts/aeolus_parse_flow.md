# Aeolus Parse Flow

## 推荐执行链路

1. **Link Fingerprinting**
   - 从用户给的链接提取：`appId`、`id`、`sid`、`rid`、`dashboardId`、`reportQuerySchemaKey`
   - 注意：原始链接中的 `id` 不一定是真实可用的 `queryHistoryId`

2. **打开页面并等待页面函数可用**
   - 优先等待：
     - `window.getReportInfoForllmForVizQuery`
     - `window.getDataQueryDatasetForAgent`

3. **结构化主干信息**
   - 调 `getReportInfoForllmForVizQuery()`
   - 重点取：
     - `data.queryHistoryId`
     - `data.sqlList`
     - `data.reqJson.query.whereList`
     - `data.reqJson.query.dimMetList`
     - `data.metaData.dataSetId`
     - `data.metaData.dataSetName`
     - `data.vizData`

4. **字段元数据**
   - 调 `getDataQueryDatasetForAgent()`
   - 重点取：
     - `dimensionList`
     - `metricsList`
     - 每个字段的 `displayName/name`、`expr`、`fullExpr`

5. **SQL 接口补强**
   - 用真实 `queryHistoryId` 请求：
     - `/aeolus/api/v3/misc/sql?queryHistoryId=<真实queryHistoryId>&detail=true`
   - SQL 来源优先级：
     1. `data.sql`
     2. `data.query_logic.full_sql`
     3. `getReportInfoForllmForVizQuery().data.sqlList`
     4. 再退回 `expr/fullExpr`

6. **字段递归展开**
   - 对：
     - 指标表达式
     - CASE WHEN
     - `[派生字段]`
     - alias / `_col_xxx`
   - 做递归展开，恢复业务口径

7. **结果值校验**
   - 用 `vizData.datasets`、`fieldMap`、`aliasMap` 校验最终结果值
   - 不要只信 SQL，不看页面结果

## 页面内执行过程日志
如果用户明确要求“把过程打印到托管页面”，则应在页面中创建一个轻量日志面板，打印：
- 指纹提取
- 页面加载完成
- 两个结构化函数调用
- 真实 queryHistoryId
- SQL 接口调用
- SQL 命中来源
- 字段递归展开
- 结果值校验
- 完成 / 遇阻原因

## 常见坑
- 原始链接 `id` 与真实 `queryHistoryId` 不一致
- 页面展示标签时间范围，不一定等于实际 SQL 过滤边界
- 一些页面只有总览卡片，没有趋势
- 一些页面 `sqlList` 有值，但 SQL 接口并不返回 `data.sql`
- 满意度/解决率等指标常常是“参评量”口径，不是“全量会话量”口径
