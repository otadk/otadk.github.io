import { isRef, toRaw } from "vue";

export const deepUnrefSafe = <T>(value: T, seen = new WeakSet()): T => {
  const raw = toRaw(value)

  // 避免循环引用死循环
  if (raw && typeof raw === 'object') {
    if (seen.has(raw)) {
      return raw
    }
    seen.add(raw)
  }

  // 如果是 ref，则递归取出 .value
  if (isRef(raw)) {
    return deepUnrefSafe(raw.value, seen) as any
  }

  // 数组：逐项递归
  if (Array.isArray(raw)) {
    return raw.map((item) => deepUnrefSafe(item, seen)) as any
  }

  // 对象：递归属性
  if (raw && typeof raw === 'object') {
    const result: any = {}
    for (const key in raw) {
      result[key] = deepUnrefSafe(raw[key], seen)
    }
    return result
  }

  // 基础类型直接返回
  return raw
}
