import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { ImagePlus } from "lucide-react";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import MediaPicker from "./MediaPicker";

interface BlockEditorProps {
  value: string;
  onChange: (html: string, blocks: string) => void;
  placeholder?: string;
  dir?: string;
}

/**
 * Block-based editor (Notion-style) with drag-and-drop.
 * Stores content as HTML (for rendering) and internally works with blocks.
 * Supports slash commands, drag-drop reordering, images, headings, lists, etc.
 * Includes a toolbar button to insert an image from the Media Library.
 */
const BlockEditor = ({ value, onChange, placeholder, dir }: BlockEditorProps) => {
  const [ready, setReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useCreateBlockNote({
    domAttributes: {
      editor: {
        dir: dir || "ltr",
      },
    },
    uploadFile: async (file: File) => {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `blog/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("cms-images")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("cms-images").getPublicUrl(path);
      return data.publicUrl;
    },
  });

  // Load initial HTML content
  useEffect(() => {
    if (!editor || ready) return;
    const loadContent = async () => {
      if (value && value.trim()) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(value);
          editor.replaceBlocks(editor.document, blocks);
        } catch {
          // ignore
        }
      }
      setReady(true);
    };
    loadContent();
  }, [editor, value, ready]);

  // Emit changes
  useEffect(() => {
    if (!editor || !ready) return;
    const handleChange = async () => {
      const html = await editor.blocksToHTMLLossy(editor.document);
      onChange(html, JSON.stringify(editor.document));
    };
    editor.onChange(handleChange);
  }, [editor, ready, onChange]);

  const insertImageFromLibrary = (url: string, alt?: string) => {
    if (!editor) return;
    const cursorBlock = editor.getTextCursorPosition()?.block;
    const newBlock = {
      type: "image" as const,
      props: {
        url,
        caption: alt ?? "",
      },
    };
    if (cursorBlock) {
      editor.insertBlocks([newBlock], cursorBlock, "after");
    } else {
      editor.insertBlocks([newBlock], editor.document[editor.document.length - 1], "after");
    }
  };

  return (
    <div className="block-editor-wrapper border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setPickerOpen(true)}
        >
          <ImagePlus size={13} /> Insert image from library
        </Button>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Tip: type <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">/</kbd> for headings, lists, tables &amp; more
        </span>
      </div>

      <div className="min-h-[200px]">
        <BlockNoteView
          editor={editor}
          theme="light"
          data-theming-css-variables-demo
        />
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={insertImageFromLibrary}
        uploadFolder="blog"
        title="Insert image into content"
      />
    </div>
  );
};

export default BlockEditor;
