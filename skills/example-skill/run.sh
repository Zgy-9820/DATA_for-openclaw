#!/bin/bash
# 示例 Skill 执行脚本
# 用法: bash run.sh [参数]

echo "🤖 示例 Skill 执行中..."

INPUT="${1:-default}"
OUTPUT="/tmp/example-skill-output.txt"

# 显示输入信息
echo "📥 输入参数: $INPUT"
echo "⏰ 执行时间: $(date '+%Y-%m-%d %H:%M:%S')"

# 这里写你的处理逻辑
cat > "$OUTPUT" << EOF
示例 Skill 执行结果
====================
输入: $INPUT
时间: $(date '+%Y-%m-%d %H:%M:%S')
状态: 成功
EOF

# 显示输出
echo ""
echo "📤 输出结果:"
cat "$OUTPUT"

echo ""
echo "✅ 执行完成！"
echo "📄 输出文件: $OUTPUT"
