#!/bin/bash
# 风神技术方案agent - 快速调用脚本
# 使用方法: ./run_fengshen_agent.sh <截图路径> [参考文档链接]

SCREENSHOT_PATH="${1:-}"
REF_DOC_URL="${2:-https://bytedance.larkoffice.com/wiki/W6sewMIdliHTV1kPLd9clZwfnfe}"

if [ -z "$SCREENSHOT_PATH" ]; then
    echo "❌ 请提供截图路径"
    echo "用法: ./run_fengshen_agent.sh /path/to/screenshot.jpg [参考文档链接]"
    exit 1
fi

echo "🦞 正在启动风神技术方案agent..."
echo "📸 截图路径: $SCREENSHOT_PATH"
echo "📄 参考文档: $REF_DOC_URL"

# 生成临时需求文件
cat > /tmp/fengshen_task.txt << EOF
# 风神技术方案生成任务

## 输入信息
- 截图路径: $SCREENSHOT_PATH
- 参考文档: $REF_DOC_URL

## 任务要求
1. 解析截图，提取所有指标信息
2. 获取参考文档的技术实现方式
3. 生成完整的技术方案文档
4. 创建飞书文档并返回链接

## 输出格式
按照参考文档的格式生成包含以下内容的文档：
- 项目概述
- 架构设计
- 详细技术实现（含SQL代码）
- 数据接入流程
- 质量保障
- 实施计划
- 风险评估
EOF

echo ""
echo "✅ 任务已准备就绪，请运行以下命令："
echo ""
echo "sessions_spawn \\"
echo "  runtime=subagent \\"
echo "  mode=run \\"
echo "  label='风神技术方案agent' \\"
echo "  task='$(cat /tmp/fengshen_task.txt | base64)'"
echo ""
