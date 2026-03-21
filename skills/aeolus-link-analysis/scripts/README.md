# scripts/

这个目录放 Aeolus 链接解析可复用的辅助脚本与脚本说明。

目标：
- 把“页面接管 → 提取 queryHistoryId → 抽 SQL / 字段 / 结果值”的经验沉淀成可复用资产
- 降低未来维护成本
- 让其他人接手时，不必只靠阅读 SKILL.md 才能理解执行链路

当前文件：
- `browser_eval_snippets.js`：可直接塞进托管浏览器 evaluate/console 的片段集合
- `aeolus_parse_flow.md`：最优执行链路说明

注意：
- 这些脚本是辅助资产，不替代 SKILL.md
- 具体流程规范、输出约束、文档模板，仍以 `../SKILL.md` 为准
