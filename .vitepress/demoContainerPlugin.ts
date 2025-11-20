import type MarkdownIt from "markdown-it";
import container from "markdown-it-container";

const ATTR_PATTERN = /(\w+)=("[^"]+"|'[^']+'|\S+)/g;

const parseAttrs = (info: string) => {
  const attrs: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = ATTR_PATTERN.exec(info))) {
    const [, key, rawValue] = match;
    const cleaned = rawValue.replace(/^['"]|['"]$/g, "");
    attrs[key] = cleaned;
  }
  return attrs;
};

interface DemoToken {
  info: string;
  nesting: number;
}

export const demoContainerPlugin = (md: MarkdownIt) => {
  md.use(container, "demo", {
    validate(params: string) {
      return !!params.trim().match(/^demo\s+/);
    },
    render(tokens: DemoToken[], idx: number) {
      const { info, nesting } = tokens[idx];
      if (nesting === 1) {
        const attrs = parseAttrs(info);
        const src = attrs.src;
        if (!src) {
          return "<p>Demo 缺少 src 属性</p>";
        }
        const escapedSrc = md.utils.escapeHtml(src);
        return `<DemoBlock src="${escapedSrc}">\n`;
      }
      return "</DemoBlock>\n";
    },
  });
};
