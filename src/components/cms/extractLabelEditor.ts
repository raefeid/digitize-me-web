import { Children, isValidElement, ReactNode } from "react";
import EditableText from "@/components/cms/EditableText";
import EditableFeatureText from "@/components/cms/EditableFeatureText";
import type { CtaLabelEditorConfig } from "@/components/cms/CtaStyleEditor";

/**
 * Walk a button's children looking for an <EditableText> element and derive
 * a CtaLabelEditorConfig from its props. Lets every CtaButton/LeadCaptureCTA
 * automatically expose a "Button text" field in the style editor dialog
 * without each call site repeating the same labelEditor object.
 */
export const extractLabelEditor = (children: ReactNode): CtaLabelEditorConfig | undefined => {
  let found: CtaLabelEditorConfig | undefined;

  const walk = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (found) return;
      if (!isValidElement(child)) return;
      if (child.type === EditableText) {
        const props = child.props as {
          page: string;
          section?: string;
          contentKey: string;
          fallback: string;
        };
        found = {
          page: props.page,
          section: props.section ?? "home",
          contentKey: props.contentKey,
          fallback: props.fallback,
        };
        return;
      }
      if (child.type === EditableFeatureText) {
        const props = child.props as {
          feature?: { slug?: string };
          field: string;
          fallback?: string;
        };
        if (props.feature?.slug) {
          found = {
            page: `feature-${props.feature.slug}`,
            section: "cta_labels",
            contentKey: props.field,
            fallback: props.fallback || "",
          };
          return;
        }
      }
      const childChildren = (child.props as { children?: ReactNode })?.children;
      if (childChildren) walk(childChildren);
    });
  };

  walk(children);
  return found;
};
