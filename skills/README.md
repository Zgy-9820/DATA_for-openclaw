# Skills 目录

这个目录用于存放 OpenClaw 的自定义技能（Skills）。

## 📁 目录结构

```
skills/
├── README.md           # 本文件
├── example-skill/      # 示例技能模板
│   ├── SKILL.md        # 技能说明文档
│   └── example.js      # 技能实现代码
└── [其他skills...]
```

## 🎯 什么是 Skill？

Skill 是 OpenClaw 的能力扩展单元，每个 Skill 定义了 AI 助手如何处理特定类型的任务。

## 🚀 创建新 Skill

### 步骤 1: 创建 Skill 目录

```bash
cd skills
mkdir your-skill-name
cd your-skill-name
```

### 步骤 2: 编写 SKILL.md

SKILL.md 是 Skill 的说明文档，包含：

```markdown
# [Skill Name]

## 描述
简要描述这个 Skill 的功能

## 使用场景
在什么情况下会触发这个 Skill

## 输入要求
使用这个 Skill 需要什么输入

## 输出内容
这个 Skill 会产生什么输出

## 使用方法
如何调用这个 Skill

## 注意事项
使用时需要注意的事项
```

### 步骤 3: 实现代码（如果需要）

根据 Skill 的复杂程度，可能需要：
- Shell 脚本
- JavaScript/TypeScript 代码
- Python 脚本
- 配置文件

### 步骤 4: 测试 Skill

在 OpenClaw 中测试你的 Skill 是否正常工作。

## 📚 现有 Skills

| Skill 名称 | 描述 | 状态 |
|-----------|------|------|
| [示例] | 示例 Skill 模板 | 📝 模板 |

## 🔧 技能分类

- **数据处理** - 数据抓取、转换、分析
- **自动化** - 定时任务、工作流自动化
- **集成** - 第三方服务集成
- **生成** - 文档生成、报告生成
- **分析** - 数据分析、洞察提取

## 📖 参考资源

- [OpenClaw Skills 文档](https://docs.openclaw.ai)
- [Skill 开发指南](https://github.com/openclaw/skills)
- [社区 Skills](https://clawhub.com)

## 🤝 贡献

欢迎提交新的 Skills！

1. Fork 本仓库
2. 创建 Skill 目录并实现功能
3. 提交 Pull Request

---

💡 提示：每个 Skill 都应该有清晰的文档和测试用例。
