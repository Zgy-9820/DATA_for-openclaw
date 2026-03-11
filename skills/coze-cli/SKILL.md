# Coze CLI Skill

## 描述
字节跳动 Coze 平台命令行工具，包含工作空间管理、机器人配置、技能发布等能力

## 工具
- HTTP Client（用于调用 Coze API）
- JSON 处理

## 使用场景
- 创建/删除机器人
- 查询工作空间信息
- 管理 Skill 和知识库
- 获取 Token 和配置信息

## 配置说明
需要配置以下环境变量：
- `COZE_API_TOKEN`: Coze 平台 API Token
- `COZE_API_BASEURL`: Coze API 基础地址

## 示例提示
- "帮我查看工作空间的所有机器人"
- "创建一个名为'测试机器人'的新机器人"
- "列出所有可用的技能"
- "获取机器人的 API Key"
- "删除 ID 为 xxx 的机器人"

## API 端点
- 获取机器人列表: GET /v1/space/list_bot
- 创建机器人: POST /v1/space/create_bot
- 删除机器人: POST /v1/space/delete_bot
- 获取技能列表: GET /v1/space/list_skill
