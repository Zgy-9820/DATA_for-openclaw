# 示例 Skill 模板

## Skill 说明
这是一个示例 Skill，用于展示如何创建和结构化一个 OpenClaw Skill。

## 使用场景
当需要创建新的自定义能力时，可以参考这个模板。

## 输入要求
- 任何需要处理的输入数据
- 配置参数（可选）

## 输出内容
- 处理结果
- 日志信息

## 使用方法

### 方式一：对话调用
```
请使用 [skill-name] 处理以下数据：[数据内容]
```

### 方式二：脚本调用
```bash
bash skills/example-skill/run.sh [参数]
```

## 实现步骤

### 第一步：定义 Skill 功能
明确这个 Skill 要解决什么问题。

### 第二步：编写 SKILL.md
详细的文档说明，包括使用方法、输入输出等。

### 第三步：实现核心逻辑
根据需求编写处理逻辑代码。

### 第四步：测试验证
确保 Skill 正常工作且结果正确。

## 注意事项

1. **文档完整性**：SKILL.md 必须包含完整的说明
2. **错误处理**：要有完善的异常处理机制
3. **日志记录**：记录关键操作和错误信息
4. **性能优化**：避免不必要的计算和资源消耗

## 示例代码

### Shell 脚本示例
```bash
#!/bin/bash
# 示例脚本

INPUT="${1:-default}"
OUTPUT="/tmp/output.txt"

echo "处理输入: $INPUT" > "$OUTPUT"
# 你的处理逻辑
```

### JavaScript 示例
```javascript
// 示例 JavaScript 代码

function process(input) {
  // 你的处理逻辑
  return output;
}
```

## 常见问题

**Q: 如何调试 Skill？**
A: 查看 `/tmp/skill-*.log` 日志文件。

**Q: 如何传递复杂参数？**
A: 使用 JSON 格式传递参数。

**Q: 如何持久化数据？**
A: 使用文件系统或数据库存储。

## 版本历史
- v1.0 (2026-03-11): 初始模板版本

## 相关文件
- `run.sh` - 执行脚本
- `config.json` - 配置文件
