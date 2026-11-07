# dsh-global-rules

[English](README.md) | 中文

DeepSeek Harness (DSH) 设置界面的「全局规则」可视化编辑插件。

直接在 Web 设置界面的左侧栏管理您的用户级全局指令文件 $DSH_HOME/AGENTS.md（默认 ~/.dsh/AGENTS.md），免去手动翻找系统隐藏目录的繁琐操作。

---

## 核心特性

- **左侧栏独立入口**：在设置（Settings）面板新增「全局规则」选项卡，无缝融入 DSH 原生 UI 风格。
- **动态路径与一键打开目录**：自动解析当前系统环境下的真实文件路径，并在路径旁提供「打开所在目录」按钮，一键在本地文件管理器（Windows 资源管理器 / macOS Finder / Linux）中高亮定位文件。
- **完整的编辑交互**：
  - 采用等宽 Monospace 代码字体，提供舒适的 Markdown 编写体验。
  - 右下角配备 **保存** 与 **取消** 按钮，支持放弃修改一键还原已保存状态。
  - 文件不存在时保存将自动创建。
- **实时热生效**：保存后新会话立即使用新规则；当前会话在下一次文件操作后由 DSH 动态感知并加载。
- **极简架构**：基于 Connection Fetch 路由与原生 ModuleLoader，无任何冗余第三方运行时依赖。

---

## 安装方法

### 方式一：从 GitHub 安装

在终端中执行：

`sh
dsh plugin --profile desktop add github:GrizzCoder/dsh-global-rules
`

*(如果使用的不是桌面版 profile，可将 desktop 替换为您对应的 profile 名称，如 web)*

### 方式二：本地开发安装

克隆本仓库到本地后，在对应工作区目录执行：

`sh
git clone https://github.com/GrizzCoder/dsh-global-rules.git
dsh plugin --profile desktop add ./dsh-global-rules
`

安装完成后刷新 Web 页面，打开左下角 **设置 → 全局规则** 即可使用。

---

## 项目结构

`
dsh-global-rules/
├── cordis.patch.yml      # 插件补丁声明
├── icon.svg              # 插件图标
├── lib/
│   ├── index.js          # Host 端服务：文件读写与系统文件管理器调用
│   └── client.js         # Client 端界面：设置页表单与交互组件
└── package.json
`

---

## 开源协议 / License

[MIT](LICENSE)

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
