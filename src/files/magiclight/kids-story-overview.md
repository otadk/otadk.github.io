# Kids Story 页面说明（/kids-story）

## 文件与职责
- `app/pc/views/kids-story/index.vue`：主页面，承担表单、模型与媒体选择、时长选择、自定义时长弹层、引导与埋点。
- `app/store/modules/children-story/index.ts`：Pinia store，管理数据源（风格、BGM、声音）、表单状态、会员校验与 `createVlog` 提交。
- `app/pc/views/kids-story/components/custom-duration-popover.vue`：自定义时长弹层（PC 悬浮 / 移动 Drawer），分钟/秒/分镜双向联动，确认后回写 `cusGptDuration`。
- `app/pc/views/kids-story/components/credit-tag.vue`：展示信用消耗标签。
- 图标、公共组件：`PageHeader`、`ResponsiveSelect`、`CaseVideo`、`DiyTour`、`GlobalLoading` 等提供骨架与交互能力。

## 页面主流程（PC & 移动端）
1) **初始化**  
   - `onMounted` 读取 `modelType` query（支持 sora/2.0 直达），调用 `vlogStore.initForm` 还原缓存并拉取风格/BGM/旁白。
   - 监听窗口与风格滚动，驱动左右箭头状态；首次 500ms 后根据 `localStorageKeys.StoryTourSeen` 弹引导。
   - 非会员默认时长重置为 1 分钟 12 分镜。
2) **文案与灵感**  
   - `Story Topic` 必填，`@change` 即缓存；分类卡片写入预设 `prompts`，移动端支持分页刷新。
3) **风格与模型选择**  
   - 风格列表横向滚动，`styleModelFilter` 控制不同风格源（Sora2 只有两条分类）；切换触发埋点并缓存。
   - `Aspect Ratio` 切换 16:9 / 9:16；`Video Model`、`Story Model`、`Language` 变更均埋点、缓存，Story Model 有会员校验并回退非会员模型。
   - 语言变更会校验当前旁白是否仍可选，否则回退默认音色。
4) **时长选择与自定义弹层**  
   - 预设 1/3/5/10/15/30 分钟，>1 分钟需登录+会员，否则重置为 1 分钟并弹会员弹窗。
   - “Customize” 打开 `custom-duration-popover.vue`：分钟/秒/分镜 5 秒一镜联动，最大 600 分镜；确认前登录校验，非会员弹会员弹窗。确认后写回 `vlogStore.cusGptDuration`，关闭弹层/下拉。
   - 价格展示：Sora2 固定 250（Max 会员 0），其余模型按分镜单价计算；预览价通过 `getPreviewBaseCredit`。
5) **媒体与试听**  
   - `Voiceover` / `Background Music` 均支持试听，关闭下拉时停止播放；旁白列表包含克隆音色，随语言过滤。
6) **预览 / 生成**  
   - `handlePreview` / `handleCreate` 先做登录校验，之后调用 `vlogStore.createVlog(isPreview)`。
   - Store 内提交会校验必填（文案长度≥20、模型/比例存在），埋点，调用 `addProject`，自定义分镜写入 `cusGptDuration`，成功跳转编辑器并清空文案；信用不足触发会员弹窗。

## 状态与缓存
- 草稿缓存：`localStorageKeys.KidsStoryForm`，字段涵盖文案、BGM、风格、模型类型、比例、视频模型、语言、自定义时长、旁白。
- 引导/案例视频可见性：`StoryTourSeen`、`KidsStoryCaseVideoClosed/B...BadgeSeen`。
- 时长弹层展示：`customPopoverVisible` + 悬停计时器，PC 跟随 `.vlog-custom-duration-option` 定位；移动端通过 Drawer extra 打开。

## 关键交互/权限节点
- 路由 `requiresAuth: true`；多处主动登录检查（时长自定义、预设 >1 分钟、预览/生成）。
- 会员校验：时长自定义、预设 >1 分钟、Story Model（VIP 模型）使用 `rewardStore.showVipPage` 提示。
- 埋点：分类、风格、模型、语言、时长、试听、创建/预览、会员弹窗等均调用 `ReportEvent.*`，详见 `index.vue` 对应处理函数。
