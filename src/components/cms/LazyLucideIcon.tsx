import { Suspense, lazy } from "react";
import type { LucideIcon } from "lucide-react";
import { resolveIconByName } from "@/lib/iconRegistry";

/**
 * Render a Lucide icon by canonical name without bundling the full ~1700-icon
 * namespace into the every-page chunk.
 *
 * - Icons in the curated registry (`iconRegistry.ts`) render synchronously.
 * - Any other name lazy-loads the full Lucide namespace as a separate async
 *   chunk (only fetched when such an icon is actually used), so the common
 *   case stays tiny and admin-picked exotic icons still resolve correctly.
 *
 * Pass `className`/`size` exactly as you would to a Lucide icon component.
 */
const FullNamespaceIcon = lazy(async () => {
  const mod = await import("lucide-react");
  const ns = mod.icons as unknown as Record<string, LucideIcon>;
  return {
    default: ({
      name,
      className,
      size,
    }: {
      name: string;
      className?: string;
      size?: number;
    }) => {
      const Cmp = ns[name];
      if (!Cmp) return null;
      return <Cmp className={className} size={size} />;
    },
  };
});

export const LazyLucideIcon = ({
  name,
  className,
  size,
}: {
  name?: string | null;
  className?: string;
  size?: number;
}) => {
  if (!name) return null;
  const Cmp = resolveIconByName(name);
  if (Cmp) return <Cmp className={className} size={size} />;
  return (
    <Suspense fallback={null}>
      <FullNamespaceIcon name={name} className={className} size={size} />
    </Suspense>
  );
};

export default LazyLucideIcon;
