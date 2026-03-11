# 风神技术方案生成 - 快速调用模板

## 一键调用命令

复制以下命令，替换参数后执行：

```bash
# 基础调用
风神技术方案agent，请帮我生成技术方案：
1. 截图：[上传截图文件]
2. 参考文档：https://bytedance.larkoffice.com/wiki/W6sewMIdliHTV1kPLd9clZwfnfe
3. 业务方：@吴晨艳
4. 数分负责人：@沈玉雯
5. 数仓负责人：@张国耀
```

## 调用方式

### 方式1：对话调用（推荐）
直接发送消息：
> "风神，帮我生成技术方案。这是截图[上传图片]，参考文档：https://xxx"

### 方式2：完整参数调用
> "请使用风神技术方案生成能力：
> 截图路径：/workspace/projects/media/screenshot.jpg
> 参考文档：https://bytedance.larkoffice.com/wiki/xxx
> 生成飞书文档发给我"

## 输入检查清单

使用前请确认：

- [ ] 截图清晰，包含完整的表格信息
- [ ] 参考文档链接可访问
- [ ] 截图中包含指标名称和指标口径
- [ ] 已获得飞书文档创建授权

## 输出预期

生成后将返回：
1. 📄 飞书文档链接
2. 📊 技术方案结构说明
3. ⚠️ 需要注意的事项

## 示例输出

```
✅ 飞书文档创建成功！
📄 文档标题：风神Bubble指标接入技术方案_v1.0
🔗 文档链接：https://www.feishu.cn/docx/RZTJd6VoboyV9Rx9XszldHMtgUb

文档包含：
- 8个指标的完整SQL实现
- 数据接入流程和配置说明
- 质量保障和风险评估
- 3天实施计划
```

## 常见问题

**Q: 支持哪些业务线？**
A: 目前支持头条作者、红果短剧、番茄小说等Bubble业务线。

**Q: 生成的SQL可以直接用吗？**
A: 建议经过数仓团队review后使用，确保与实际数据源匹配。

**Q: 可以修改默认模板吗？**
A: 可以，编辑 `/workspace/projects/workspace/skills/fengshen-tech-proposal/SKILL.md` 文件。

**Q: 生成的文档格式不对怎么办？**
A: 提供参考文档链接，系统会自动参考其格式。
