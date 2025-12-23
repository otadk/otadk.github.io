# Religion Story 用户链路（/videos/create/religious-story）

## 入口与初始化
- 路由元信息 `requiresAuth: true`，未登录会被路由守卫重定向登录页。
- 页面挂载时调用 `useReligionStoryStore().initForm()`：从 `localStorageKeys.ReligionStoryForm` 恢复缓存，拉取风格、BGM、旁白音色与克隆音色，设置默认的视频模型、BGM、风格与旁白，非会员时将时长重置为 1 分钟（12 分镜）。
- 首次访问会在 500ms 后弹出引导 `DiyTour`（localStorage 键 `StoryTourSeen` 控制）。

## 主要操作流（用户链路）
1) **Story Topic**：输入主题（必填，≥20 字符），`@change` 即存储草稿。
2) **分类灵感**：点击分类卡片写入模板文案到输入框并保存草稿；移动端可刷新切换三条列表窗口。
3) **风格选择**：横向风格列表（滚动/左右按钮），默认选中首个风格；支持按模型类型过滤（ResponsiveSelect `styleModelFilter`）。
4) **Aspect Ratio**：在 16:9（默认）与 9:16 之间切换，同时写入缓存。
5) **Video Duration**：
   - 预设 1/3/5/10/15/30 分钟。1 分钟不需要会员；其它选项需登录 + 会员，否则重置为 1 分钟并弹出会员弹窗。
   - “Customize” 入口（PC 悬停/点击浮层，移动端 drawerExtra 按钮）打开自定义时长弹窗。
6) **自定义时长弹窗**（PC 悬浮层，移动端 BottomDrawer）：
   - 表单：分钟、秒、分镜数双向联动（5 秒/镜，最大 600 分镜），默认取当前选择。
   - 确认：需先登录；非会员直接弹会员弹窗；会员写回 `cusGptDuration` 并关闭弹层/下拉。
   - PC 悬浮层跟随 `.vlog-custom-duration-option` 定位，滚动/窗口变化会重算位置；鼠标悬停共享隐藏计时器以避免抖动。
7) **Language / Story Model / Video Model**：
   - 语言切换会校验当前旁白是否仍可用，失效则回退默认旁白。
   - Story Model（含 Gemini 3/GPT5 免费状态查询）和 Video Model 选择都会触发埋点与缓存。
8) **Voiceover**：选择旁白音色，支持试听（点击播放/停止）；下拉关闭时自动停止播放。
9) **Background Music**：选择并试听 BGM，下拉关闭时停止播放。
10) **Preview Storyboard / Create Video** 按钮：
    - 点击前检查登录（未登录跳转登录）、Story Topic 非空且 ≥20 字符、视频模型与比例已选。
    - 移动端非会员点击会直接弹会员弹窗。
    - 预览按钮调用 `createVlog(true)`（落到生图流程）；创建按钮调用 `createVlog(false)`（跳编辑器）。

## 关键校验与权限节点
- 路由 requiresAuth；自定义时长确认、预设 >1 分钟、创建/预览均需登录。
- 预设 >1 分钟与自定义时长都要求会员，失败时显示会员弹窗并重置为 1 分钟。
- 表单校验：缺少 Story Topic、长度 <20、缺少视频模型或比例时会弹错误提示并阻断。
- 创建接口返回信用不足/需付费码时会再次弹会员弹窗。

## 数据持久化与恢复
- 草稿存储键：`localStorageKeys.ReligionStoryForm`，字段包括 fullText、bgm、styleId、styleModelFilter、ratio、vlogImage2VideoModel、language、cusGptDuration、voiceId。
- 页面初始化会先读缓存再加载远端数据；每次相关字段变更均调用 `saveFormCache`。
- 引导、案例浮层、下拉可见状态等 UI 状态不入缓存。

## 提交流程（createVlog）
- 记录埋点（预览/创建区分）并附带语言、比例、风格、模型、BGM 等上下文。
- 调用 `addProject`，`cusGptDuration.storyboardCount` 若非自定义则写入 -1。
- 成功：toast 提示、清空 Story Topic、保存缓存、路由跳转到编辑器携带新项目 id。
- 失败：信用不足时唤起会员弹窗，其它错误 toast。
