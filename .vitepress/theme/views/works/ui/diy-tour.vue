<script setup lang="ts">
/**
 * @fileoverview 新手引导通用组件
 */
import type { CSSProperties } from 'vue';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

type BasePlacement = 'top' | 'bottom' | 'left' | 'right';
type Placement = BasePlacement | (string & {});
type TargetResolver =
  | string
  | HTMLElement
  | (() => HTMLElement | null | undefined);
interface Offset {
  x?: number;
  y?: number;
}
interface MaskOffset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
export interface TourStep {
  advanceOnMask?: boolean | undefined;
  target?: TargetResolver;
  title?: string;
  content?: string;
  videoUrl?: string;
  placement?: Placement;
  gap?: number;
  radius?: number;
  mask?: boolean;
  maskColor?: string;
  scrollIntoView?: boolean;
  closeOnMask?: boolean;
  offset?: Offset;
  maskOffset?: MaskOffset;
  width?: number | string;
  popoverClass?: string;
  cardColor?: string;
  arrow?: boolean;
  arrowStyle?: CSSProperties;
}

type CloseTrigger = 'manual' | 'mask' | 'finish' | 'esc' | (string & {});
interface PopoverPosition {
  top: number;
  left: number;
  placement: BasePlacement;
}
interface Viewport {
  width: number;
  height: number;
}
interface HoleRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  radius: number;
  raw: DOMRect;
}

interface TourProps {
  /** 控制是否展示引导 */
  modelValue?: boolean;
  /** 当前步骤索引（可配合 v-model:current） */
  current?: number;
  /** 步骤描述集合 */
  steps?: TourStep[];
  /** 全局默认位置 */
  placement?: Placement;
  /** 遮罩是否开启 */
  mask?: boolean;
  /** 遮罩颜色 */
  maskColor?: string;
  /** 高亮区域圆角 */
  radius?: number;
  /** 高亮区域与目标的间距 */
  gap?: number;
  /** 遮罩点击时是否关闭 */
  closeOnMask?: boolean;
  /** 遮罩点击时是否直接进入下一步，默认不前进 */
  advanceOnMask?: boolean;
  /** 自动滚动到目标 */
  scrollIntoView?: boolean;
  /** 业务页面标识，用于埋点：kids-song / kids-story / science-story / religion-story */
  page?: string;
  /** 允许键盘控制（Esc 关闭，左右切换） */
  allowKeyboard?: boolean;
  /** 是否展示序号圆点 */
  showIndicators?: boolean;
  /** popover 是否带箭头 */
  arrow?: boolean;
  /** 自定义卡片宽度（数值会自动加 px） */
  width?: number | string;
  /** popover 的层级 */
  zIndex?: number;
  /** 遮罩高亮区域的上下左右偏移 */
  maskOffset?: MaskOffset;
}

const props = withDefaults(defineProps<TourProps>(), {
  modelValue: false,
  current: 0,
  steps: () => [] as TourStep[],
  placement: 'bottom',
  mask: true,
  maskColor: 'rgba(0, 0, 0, 0.7)',
  radius: 16,
  gap: 8,
  closeOnMask: true,
  advanceOnMask: false,
  scrollIntoView: true,
  allowKeyboard: true,
  showIndicators: true,
  arrow: true,
  width: 400,
  zIndex: 2020,
  maskOffset: () => ({}),
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:current', value: number): void;
  (e: 'change', value: number): void;
  (e: 'finish'): void;
  (e: 'close', payload: { trigger: CloseTrigger; index: number }): void;
}>();

const placementFallback: BasePlacement = 'bottom';
function normalizePlacement(placement?: Placement): BasePlacement {
  if (!placement) return placementFallback;
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('left')) return 'left';
  if (placement.startsWith('right')) return 'right';
  return placementFallback;
}

const isClient = typeof window !== 'undefined';
const popoverRef = ref<HTMLElement | null>(null);
const internalOpen = ref<boolean>(props.modelValue);
const activeIndex = ref<number>(props.current || 0);
const holeRect = ref<HoleRect | null>(null);
const popoverPosition = ref<PopoverPosition>({
  top: 0,
  left: 0,
  placement: normalizePlacement(props.placement),
});
const viewport = ref<Viewport>({
  width: isClient ? window.innerWidth : 0,
  height: isClient ? window.innerHeight : 0,
});

const resolvedStep = computed<TourStep>(() => {
  const step = props.steps?.[activeIndex.value] || {};
  return { ...step } as TourStep;
});
const maskColor = computed(
  () => resolvedStep.value.maskColor || props.maskColor,
);
const maskHoleStyle = computed<CSSProperties>(() => {
  const rect = holeRect.value;
  if (!rect) return {};
  return {
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderRadius: '12px',
    boxShadow: `0 0 0 9999px ${maskColor.value}`,
  };
});
const mergedOpen = computed({
  get: () => internalOpen.value,
  set: (val: boolean) => {
    internalOpen.value = val;
    emit('update:modelValue', val);
  },
});

const stepCount = computed<number>(() => props.steps?.length || 0);

function resolveTarget(step?: TourStep): HTMLElement | null {
  const target = step?.target;
  if (!target) return null;
  if (typeof target === 'string')
    return document.querySelector<HTMLElement>(target);
  if (typeof target === 'function') {
    try {
      return target() ?? null;
    } catch (e) {
      console.warn('[DiyTour] target resolver error', e);
      return null;
    }
  }
  return target instanceof HTMLElement ? target : null;
}

function clampIndex(index: number): number {
  if (!stepCount.value) return 0;
  return Math.min(Math.max(index, 0), stepCount.value - 1);
}

function toPx(val: number | string | undefined): string {
  if (val == null) return '';
  return typeof val === 'number' ? `${val}px` : val;
}

function updateViewport() {
  if (!isClient) return;
  viewport.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  // 同步更新高亮与浮层位置，确保窗口变化时仍对齐
  if (mergedOpen.value) {
    updatePosition();
  }
}

function close(trigger: CloseTrigger = 'manual') {
  if (!mergedOpen.value) return;
  mergedOpen.value = false;
  emit('close', { trigger, index: activeIndex.value });
}

async function ensureVisible(
  el: HTMLElement | null,
  behavior: ScrollBehavior = 'smooth',
) {
  if (
    !el ||
    !props.scrollIntoView ||
    resolvedStep.value.scrollIntoView === false
  )
    return;
  el.scrollIntoView({
    behavior,
    block: 'center',
    inline: 'center',
  });
}

function computeHoleRect() {
  const step = resolvedStep.value;
  const el = resolveTarget(step);
  if (!el) {
    holeRect.value = null;
    return;
  }
  const rect = el.getBoundingClientRect();
  const gap = step.gap ?? props.gap;
  const maskOffset = step.maskOffset || props.maskOffset || {};
  const leftGap = maskOffset.left ?? gap;
  const rightGap = maskOffset.right ?? gap;
  const topGap = maskOffset.top ?? gap;
  const bottomGap = maskOffset.bottom ?? gap;
  const radius = step.radius ?? props.radius;
  const left = Math.max(rect.left - leftGap, 0);
  const top = Math.max(rect.top - topGap, 0);
  const width = Math.min(
    rect.width + leftGap + rightGap,
    viewport.value.width - left,
  );
  const height = Math.min(
    rect.height + topGap + bottomGap,
    viewport.value.height - top,
  );
  holeRect.value = {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    radius,
    raw: rect,
  };
}

function computePopoverPlacement(
  targetRect: HoleRect | null,
  popWidth: number,
  popHeight: number,
  placement?: Placement,
  offset?: Offset,
): PopoverPosition {
  const basePlacement = normalizePlacement(
    placement || resolvedStep.value.placement || props.placement,
  );
  const off: Offset = offset || resolvedStep.value.offset || { x: 0, y: 0 };
  const defaultTop = viewport.value.height / 2 - popHeight / 2;
  const defaultLeft = viewport.value.width / 2 - popWidth / 2;
  if (!targetRect) {
    return {
      top: defaultTop + (off.y || 0),
      left: defaultLeft + (off.x || 0),
      placement: basePlacement,
    };
  }
  const gap = resolvedStep.value.gap ?? props.gap;
  const centerX = targetRect.left + targetRect.width / 2;
  const centerY = targetRect.top + targetRect.height / 2;
  let top = defaultTop;
  let left = defaultLeft;
  switch (basePlacement) {
    case 'top':
      top = targetRect.top - popHeight - gap;
      left = centerX - popWidth / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + gap;
      left = centerX - popWidth / 2;
      break;
    case 'left':
      top = centerY - popHeight / 2;
      left = targetRect.left - popWidth - gap;
      break;
    case 'right':
      top = centerY - popHeight / 2;
      left = targetRect.right + gap;
      break;
    default:
      top = defaultTop;
      left = defaultLeft;
      break;
  }
  const margin = 12;
  const clampedTop = Math.max(
    margin,
    Math.min(top, viewport.value.height - popHeight - margin),
  );
  const clampedLeft = Math.max(
    margin,
    Math.min(left, viewport.value.width - popWidth - margin),
  );
  return {
    top: clampedTop + (off.y || 0),
    left: clampedLeft + (off.x || 0),
    placement: basePlacement,
  };
}

async function updatePosition() {
  computeHoleRect();
  await nextTick();
  const pop = popoverRef.value;
  const size = pop
    ? pop.getBoundingClientRect()
    : {
        width: Number(resolvedStep.value.width ?? props.width) || 320,
        height: 160,
      };
  popoverPosition.value = computePopoverPlacement(
    holeRect.value,
    size.width,
    size.height,
    resolvedStep.value.placement,
    resolvedStep.value.offset,
  );
}

async function goTo(index: number) {
  const nextIndex = clampIndex(index);
  if (!stepCount.value) return;
  activeIndex.value = nextIndex;
  emit('update:current', nextIndex);
  emit('change', nextIndex);
  await nextTick();
  const el = resolveTarget(resolvedStep.value);
  await ensureVisible(el);
  updatePosition();
}

function next() {
  const nextIndex = activeIndex.value + 1;
  if (nextIndex >= stepCount.value) {
    emit('finish');
    close('finish');
  } else {
    goTo(nextIndex);
  }
}

function prev() {
  const prevIndex = activeIndex.value - 1;
  if (prevIndex < 0) return;
  goTo(prevIndex);
}

function openFromStart() {
  mergedOpen.value = true;
  goTo(activeIndex.value || 0);
}

function handleSkip() {
  close('manual');
}

function handleMaskClick() {
  const allowAdvance =
    resolvedStep.value.closeOnMask ??
    resolvedStep.value.advanceOnMask ??
    props.advanceOnMask ??
    props.closeOnMask;
  if (allowAdvance) {
    next();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!mergedOpen.value || !props.allowKeyboard) return;
  if (e.key === 'Escape') {
    close('esc');
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault();
    next();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  }
}

function attachListeners() {
  if (!isClient) return;
  window.addEventListener('resize', updateViewport);
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('keydown', handleKeydown);
}

function removeListeners() {
  if (!isClient) return;
  window.removeEventListener('resize', updateViewport);
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('keydown', handleKeydown);
}

watch(
  () => props.modelValue,
  (val) => {
    const nextOpen = Boolean(val);
    mergedOpen.value = nextOpen;
    if (nextOpen) {
      goTo(props.current || 0);
    }
  },
);

watch(
  () => props.current,
  (val) => {
    const clamped = clampIndex(val ?? 0);
    if (clamped !== activeIndex.value) {
      activeIndex.value = clamped;
      if (mergedOpen.value) {
        goTo(clamped);
      }
    }
  },
);

watch(
  () => resolvedStep.value,
  () => {
    if (mergedOpen.value) {
      updatePosition();
    }
  },
  { deep: true },
);

watch(
  () => mergedOpen.value,
  (val) => {
    if (val) {
      openFromStart();
      attachListeners();
    } else {
      removeListeners();
    }
  },
);

onMounted(() => {
  updateViewport();
  if (mergedOpen.value) {
    openFromStart();
    attachListeners();
  }
});

onBeforeUnmount(() => {
  removeListeners();
});
</script>

<template>
  <teleport to="body">
    <transition name="diy-tour-fade">
      <div
        v-if="mergedOpen && stepCount"
        class="diy-tour"
        :style="{ zIndex: props.zIndex }"
      >
        <div
          v-if="(resolvedStep.mask ?? props.mask) && holeRect"
          class="diy-tour__mask"
          :style="{ zIndex: props.zIndex }"
          @click="handleMaskClick"
        >
          <div
            class="diy-tour__mask-piece top"
            :style="{
              height: `${holeRect.top}px`,
            }"
          ></div>
          <div class="diy-tour__mask-piece middle">
            <div
              class="diy-tour__mask-piece left"
              :style="{
                width: `${holeRect.left}px`,
              }"
            ></div>
            <div class="diy-tour__mask-hole" :style="maskHoleStyle"></div>
            <div
              class="diy-tour__mask-piece right"
              :style="{
                width: `${viewport.width - holeRect.right}px`,
              }"
            ></div>
          </div>
          <div
            class="diy-tour__mask-piece bottom"
            :style="{
              height: `${viewport.height - holeRect.bottom}px`,
            }"
          ></div>
        </div>

        <div
          ref="popoverRef"
          class="diy-tour__popover"
          :class="[
            `is-${popoverPosition.placement}`,
            resolvedStep.popoverClass,
          ]"
          :style="{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
            width: toPx(resolvedStep.width ?? props.width),
            zIndex: props.zIndex + 2,
          }"
        >
          <slot
            name="step"
            :step="resolvedStep"
            :index="activeIndex"
            :next="next"
            :prev="prev"
            :close="close"
            :go-to="goTo"
            :is-last="activeIndex === stepCount - 1"
          >
            <div class="diy-tour__content diy-tour__content--inline">
              <slot name="content" :step="resolvedStep" :index="activeIndex">
                {{ resolvedStep.content }}
              </slot>
            </div>
            <video
              v-if="resolvedStep.videoUrl"
              class="diy-tour__video"
              :src="resolvedStep.videoUrl"
              autoplay
              loop
              muted
              playsinline="true"
              webkit-playsinline="true"
              x-webkit-airplay="allow"
              x5-video-player-type="h5"
              preload="auto"
              @loadedmetadata="updatePosition"
            ></video>
            <div class="diy-tour__footer">
              <div class="diy-tour__progress">
                <div class="diy-tour__progress--active">
                  {{ `${activeIndex + 1}` }} </div
                >/{{ stepCount }}
              </div>
              <div class="diy-tour__actions">
                <template v-if="activeIndex === stepCount - 1">
                  <div class="diy-tour__btn primary" @click="next">
                    Got it
                  </div>
                </template>
                <template v-else>
                  <div class="diy-tour__btn" @click="handleSkip"> Skip </div>
                  <div class="diy-tour__btn primary" @click="next"> Next </div>
                </template>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.diy-tour {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.diy-tour__mask {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  pointer-events: auto;
}

.diy-tour__mask-piece {
  background: inherit;
  width: 100%;
}

.diy-tour__mask-piece.middle {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.diy-tour__mask-piece.left,
.diy-tour__mask-piece.right {
  height: 100%;
}

.diy-tour__mask-hole {
  background: transparent;
  pointer-events: none;
}

.diy-tour__popover {
  position: fixed;
  background: radial-gradient(circle at 20% 20%, rgba(71, 191, 255, 0.08), rgba(17, 24, 39, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.03);
  padding: 24px;
  color: #e5e7eb;
  pointer-events: auto;
  max-width: 90vw;
  backdrop-filter: blur(12px);
}

.diy-tour__content {
  margin: 12px 0 4px;
  font-size: 14px;
  line-height: 1.6;
  color: #cbd5e1;
}

.diy-tour__content--inline {
  color: #f8fafc;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 1.6;
  margin: 0 0 14px 0;
}

.diy-tour__video {
  width: 100%;
  max-height: min(320px, 40vh);
  border-radius: 8px;
  background: #000;
  margin: 0 0 16px 0;
  object-fit: contain;
  border: none;
  outline: none;
  display: block;
  -webkit-tap-highlight-color: transparent;
}

.diy-tour__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.diy-tour__progress {
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
}

.diy-tour__progress--active {
  color: #fff;
}

.diy-tour__dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.diy-tour__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #e5e7eb;
  cursor: pointer;
  padding: 0;
}

.diy-tour__dot.active {
  background: #3b82f6;
}

.diy-tour__actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.diy-tour__btn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.82);
  cursor: pointer;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  padding: 6px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  transition: transform 0.12s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.diy-tour__btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 10px 32px rgba(71, 191, 255, 0.22);
  transform: translateY(-1px);
}

.diy-tour__btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 6px 18px rgba(71, 191, 255, 0.16);
}

.diy-tour__btn:disabled {
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.45);
  box-shadow: none;
  transform: none;
}

.diy-tour__btn.primary {
  display: flex;
  padding: 10px 28px;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #1a9bff 0%, #47bfff 50%, #90e0ff 100%);
  color: #0b1021;
  font-weight: 700;
  border: none;
  box-shadow: 0 16px 42px rgba(71, 191, 255, 0.32);
}


.diy-tour-fade-enter-active,
.diy-tour-fade-leave-active {
  transition: opacity 0.2s ease;
}

.diy-tour-fade-enter-from,
.diy-tour-fade-leave-to {
  opacity: 0;
}
</style>
