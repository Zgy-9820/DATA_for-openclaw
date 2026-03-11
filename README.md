# DATA_for-openclaw

> OpenClaw 配置、Skills 和自动化工具集合

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-2026.3.7-green.svg)](https://docs.openclaw.ai)

## 📋 简介

这是一个 OpenClaw AI 助手的工作空间配置仓库，包含：
- ✅ **OpenClaw 核心配置** - 完整的运行时配置
- 🔧 **自动化脚本** - 服务启动、重启、停止
- 🤖 **自定义 Skills** - 扩展 AI 能力的工具集
- 📚 **飞书/企业微信集成** - 消息推送和通知

## 🚀 快速开始

### 前置要求

- Docker (推荐) 或 Node.js v24+
- Git
- Coze API 密钥

### 安装

```bash
# 克隆仓库
git clone https://github.com/Zgy-9820/DATA_for-openclaw.git
cd DATA_for-openclaw

# 启动服务
bash scripts/start.sh
```

### 基础命令

```bash
# 启动 OpenClaw
bash scripts/start.sh

# 重启服务
bash scripts/restart.sh

# 停止服务
bash scripts/stop.sh
```

## 📦 目录结构

```
DATA_for-openclaw/
├── .coze                          # Coze 集成配置
├── .gitignore                     # Git 忽略规则
├── openclaw.json                  # OpenClaw 主配置文件
├── scripts/                       # 自动化脚本
│   ├── start.sh                   # 启动脚本
│   ├── stop.sh                    # 停止脚本
│   └── restart.sh                 # 重启脚本
└── workspace/                     # 工作空间
    └── skills/                    # 自定义 Skills
        └── fengshen-tech-proposal/ # 风神技术方案生成
            ├── SKILL.md           # 技能说明
            ├── QUICK_START.md     # 快速开始
            └── run_fengshen_agent.sh  # 调用脚本
```

## 🛠️ 配置说明

### 主要配置项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| Gateway 端口 | 服务监听端口 | 5000 |
| 工作区目录 | 工作空间路径 | `/workspace/projects/workspace` |
| 最大并发数 | 子 Agent 最大并发数 | 8 |
| 浏览器 | Chrome 无头模式 | 已启用 |

### 支持的 AI 模型

- Kimi K2.5 (262K 上下文)
- GLM 4.7 (204K 上下文)
- DeepSeek 3.2 (131K 上下文)
- 豆包 2.0 Pro/Lite/Mini (262K 上下文，支持图像)

### 集成服务

| 服务 | 状态 | 说明 |
|------|------|------|
| 飞书 | ✅ 启用 | 飞书消息推送 |
| 企业微信 | ✅ 启用 | 企业微信集成 |
| 飞书插件 | ✅ 已安装 | `@larksuiteoapi/feishu-openclaw-plugin@2026.3.8` |
| 企业微信插件 | ✅ 已安装 | `@wecom/wecom-openclaw-plugin@1.0.0` |

## 🎯 自定义 Skills

### 风神技术方案生成 (fengshen-tech-proposal)

一个专门用于生成飞书 Bubble 目标管理技术方案的 AI 助手能力。

**功能特性：**
- ✅ 自动解析截图表格
- ✅ 生成完整技术方案文档
- ✅ 创建飞书文档
- ✅ SQL 代码自动生成

**使用方法：**
```bash
# 方式1: 对话调用
风神，帮我生成技术方案。截图在 /path/to/screenshot.jpg

# 方式2: 脚本调用
bash workspace/skills/fengshen-tech-proposal/run_fengshen_agent.sh /path/to/screenshot.jpg
```

详细文档请查看 [fengshen-tech-proposal](./workspace/skills/fengshen-tech-proposal/)

## 📊 自动化任务

### 定时任务

通过 HEARTBEAT.md 配置的定时任务：
- 📚 09:00 - 学习打工圣体板块
- 🔄 10:00 - 更新飞书插件
- 📊 14:30 - 检查炒股竞技场持仓
- 🦞 14:35 - 自动交易执行

## 🔐 环境变量

需要配置的环境变量：

```bash
# Coze API
export COZE_INTEGRATION_MODEL_BASE_URL="https://api.coze.com"
export COZE_WORKLOAD_IDENTITY_API_KEY="your-api-key"

# 飞书配置
export FEISHU_APP_ID="cli_a924c8b7b33a9cbb"
export FEISHU_APP_SECRET="your-app-secret"
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [飞书开放平台](https://open.feishu.cn)

## 📞 联系方式

- GitHub: [@Zgy-9820](https://github.com/Zgy-9820)

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
