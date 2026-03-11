# 推荐安装的 Skill 列表

## 🔥 高频实用 Skill（强烈推荐）

### 1. **飞书生态增强**
| Skill | 功能 | 适用场景 |
|-------|------|----------|
| feishu-calendar | 日程管理、会议预约 | 自动管理日历 |
| feishu-task | 任务管理、待办追踪 | 任务自动化 |
| feishu-bitable | 多维表格操作 | 数据处理 |
| feishu-im-read | 消息读取、历史搜索 | 信息检索 |

### 2. **开发运维**
| Skill | 功能 | 适用场景 |
|-------|------|----------|
| github | GitHub 操作、PR管理 | 代码协作 |
| gitlab | GitLab 集成 | 代码仓库 |
| docker | 容器管理 | 部署运维 |
| k8s | Kubernetes 操作 | 集群管理 |

### 3. **数据与内容**
| Skill | 功能 | 适用场景 |
|-------|------|----------|
| web-search | 网络搜索 | 信息收集 |
| web-fetch | 网页抓取 | 内容获取 |
| pdf | PDF 处理 | 文档分析 |
| image-gen | 图像生成 | 视觉创作 |

### 4. **效率工具**
| Skill | 功能 | 适用场景 |
|-------|------|----------|
| browser | 浏览器控制 | 网页自动化 |
| code-reviewer | 代码审查 | 质量保障 |
| debugger | 调试助手 | 问题排查 |
| session-logger | 会话记录 | 记忆管理 |

## 📦 安装方式

### 方式1：字节内部仓库（推荐）
```bash
ai-skills add <来源> --source github --skill <name> --dir ~/.openclaw/workspace/skills
```

### 方式2：ClawHub（便捷）
```bash
clawhub install <skill-slug>
```

### 方式3：Git Clone（手动）
```bash
cd /workspace/projects/workspace/skills/
git clone <repo-url> <skill-name>
```

## ✅ 当前已安装
- self-improving-agent（自我进化系统）
- agent-browser（AI 模型访问）
- coze-image-gen（图像生成）
- coze-voice-gen（语音合成）
- coze-web-fetch（网页抓取）
- coze-web-search（网络搜索）
