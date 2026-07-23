"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Redo2,
  Replace,
  Search,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string | null>;
}

function findNextInEditor(editor: Editor, query: string, fromPos: number): boolean {
  if (!query) return false;
  const { doc } = editor.state;
  let match: { from: number; to: number } | null = null;

  doc.descendants((node, pos) => {
    if (match || !node.isText || !node.text) return;
    const text = node.text;
    const nodeEnd = pos + text.length;
    if (nodeEnd <= fromPos) return;
    const start = Math.max(0, fromPos - pos);
    const index = text.indexOf(query, start);
    if (index !== -1) {
      match = { from: pos + index, to: pos + index + query.length };
    }
  });

  if (!match) {
    doc.descendants((node, pos) => {
      if (match || !node.isText || !node.text) return;
      const index = node.text.indexOf(query);
      if (index !== -1) {
        match = { from: pos + index, to: pos + index + query.length };
      }
    });
  }

  if (!match) return false;
  editor.chain().focus().setTextSelection(match).scrollIntoView().run();
  return true;
}

function replaceAllInEditor(editor: Editor, search: string, replacement: string): number {
  if (!search) return 0;
  const { doc } = editor.state;
  const replacements: { from: number; to: number; text: string }[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text || !node.text.includes(search)) return;
    const text = node.text;
    let localFrom = 0;
    while (true) {
      const index = text.indexOf(search, localFrom);
      if (index === -1) break;
      replacements.push({
        from: pos + index,
        to: pos + index + search.length,
        text: replacement,
      });
      localFrom = index + search.length;
    }
  });

  if (replacements.length === 0) return 0;

  let tr = editor.state.tr;
  for (let i = replacements.length - 1; i >= 0; i -= 1) {
    const r = replacements[i];
    tr = tr.insertText(r.text, r.from, r.to);
  }
  editor.view.dispatch(tr);
  return replacements.length;
}

export function ArticleRichEditor({
  value,
  onChange,
  onUploadImage,
}: ArticleRichEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [fullscreen, setFullscreen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const uploadRef = useRef(onUploadImage);
  uploadRef.current = onUploadImage;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const insertUploadedImage = useCallback(async (file: File, ed: Editor) => {
    const upload = uploadRef.current;
    if (!upload) return false;
    const url = await upload(file);
    if (url) {
      ed.chain().focus().setImage({ src: url }).run();
      return true;
    }
    return false;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write your article…" }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ width: 640, height: 360 }),
      CharacterCount,
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChangeRef.current(html);
      setHtmlDraft(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[360px] px-5 py-4 focus:outline-none text-white/90",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class:
            "prose prose-sm max-w-none min-h-[360px] px-5 py-4 focus:outline-none text-white/90",
        },
        handlePaste: (_view, event) => {
          const items = event.clipboardData?.items;
          if (!items || !uploadRef.current) return false;
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (!file) continue;
              event.preventDefault();
              void insertUploadedImage(file, editor);
              return true;
            }
          }
          return false;
        },
        handleDrop: (_view, event) => {
          const files = event.dataTransfer?.files;
          if (!files?.length || !uploadRef.current) return false;
          const image = Array.from(files).find((f) => f.type.startsWith("image/"));
          if (!image) return false;
          event.preventDefault();
          const coords = editor.view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (coords) {
            editor.commands.setTextSelection(coords.pos);
          }
          void insertUploadedImage(image, editor);
          return true;
        },
      },
    });
  }, [editor, insertUploadedImage]);

  useEffect(() => {
    if (!editor) return;
    if (mode === "visual" && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      setHtmlDraft(value || "");
    }
  }, [value, editor, mode]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const addLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = async () => {
    if (!editor) return;
    if (onUploadImage) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const url = await onUploadImage(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
      };
      input.click();
      return;
    }
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    if (!editor) return;
    const url = window.prompt("YouTube URL");
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };

  const handleFindNext = () => {
    if (!editor) return;
    const query = window.prompt("Find", findQuery) ?? "";
    if (!query) return;
    setFindQuery(query);
    const from = editor.state.selection.to;
    const found = findNextInEditor(editor, query, from);
    if (!found) window.alert(`No matches for “${query}”`);
  };

  const handleReplace = () => {
    if (!editor) return;
    const query = window.prompt("Find", findQuery) ?? "";
    if (!query) return;
    setFindQuery(query);
    const replacement = window.prompt("Replace with", "");
    if (replacement === null) return;

    const { from, to, empty } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to);
    if (!empty && selected === query) {
      editor.chain().focus().insertContentAt({ from, to }, replacement).run();
      findNextInEditor(editor, query, from + replacement.length);
      return;
    }

    const found = findNextInEditor(editor, query, editor.state.selection.from);
    if (!found) {
      window.alert(`No matches for “${query}”`);
      return;
    }
    const sel = editor.state.selection;
    editor
      .chain()
      .focus()
      .insertContentAt({ from: sel.from, to: sel.to }, replacement)
      .run();
  };

  const handleReplaceAll = () => {
    if (!editor) return;
    const query = window.prompt("Find", findQuery) ?? "";
    if (!query) return;
    setFindQuery(query);
    const replacement = window.prompt("Replace all with", "");
    if (replacement === null) return;
    const count = replaceAllInEditor(editor, query, replacement);
    window.alert(
      count > 0
        ? `Replaced ${count} occurrence${count === 1 ? "" : "s"}.`
        : `No matches for “${query}”`
    );
  };

  const switchToHtml = () => {
    if (editor) setHtmlDraft(editor.getHTML());
    setMode("html");
  };

  const switchToVisual = () => {
    onChange(htmlDraft);
    editor?.commands.setContent(htmlDraft || "", { emitUpdate: false });
    setMode("visual");
  };

  const plainFallback = htmlDraft.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const characters =
    mode === "visual" && editor
      ? editor.storage.characterCount.characters()
      : plainFallback.length;
  const words =
    mode === "visual" && editor
      ? editor.storage.characterCount.words()
      : plainFallback
        ? plainFallback.split(/\s+/).filter(Boolean).length
        : 0;

  if (!editor) {
    return (
      <div className="rounded-xl border border-luxury-gold/20 bg-black/30 p-8 text-sm text-white/40">
        Loading editor…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-luxury-gold/20 bg-[#0B1612]",
        fullscreen && "fixed inset-0 z-[80] rounded-none border-0"
      )}
    >
      <div className="space-y-1 border-b border-luxury-gold/15 bg-[#0F1C18] p-2">
        <div className="flex flex-wrap items-center gap-1">
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo2 className="h-4 w-4" />
          </ToolBtn>
          <Sep />
          <select
            className="h-8 rounded border border-luxury-gold/20 bg-black/40 px-2 text-xs text-white"
            value={
              editor.isActive("heading", { level: 1 })
                ? "h1"
                : editor.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor.isActive("heading", { level: 3 })
                    ? "h3"
                    : editor.isActive("heading", { level: 4 })
                      ? "h4"
                      : "p"
            }
            onChange={(e) => {
              const v = e.target.value;
              if (v === "p") editor.chain().focus().setParagraph().run();
              else
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: Number(v.replace("h", "")) as 1 | 2 | 3 | 4 })
                  .run();
            }}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <Sep />
          <ToolBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline code"
          >
            <Code className="h-4 w-4" />
          </ToolBtn>
          <Sep />
          <ToolBtn
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <List className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
            title="Indent"
          >
            »
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().liftListItem("listItem").run()}
            title="Outdent"
          >
            «
          </ToolBtn>
          <Sep />
          <ToolBtn
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolBtn>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <label className="flex h-8 items-center gap-1 rounded border border-luxury-gold/20 bg-black/40 px-2 text-[10px] text-white/60">
            A
            <input
              type="color"
              className="h-5 w-5 cursor-pointer border-0 bg-transparent"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              title="Text color"
            />
          </label>
          <ToolBtn
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight({ color: "#D4AF3766" }).run()}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </ToolBtn>
          <Sep />
          <ToolBtn active={editor.isActive("link")} onClick={addLink} title="Link">
            <Link2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={addImage} title="Image">
            <ImageIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            title="Table"
          >
            <TableIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={addYoutube} title="YouTube">
            <YoutubeIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider"
          >
            <Minus className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code block"
          >
            <Code2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="H1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="H2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="H3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolBtn>
          <Sep />
          <ToolBtn onClick={handleFindNext} title="Find">
            <Search className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={handleReplace} title="Replace">
            <Replace className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={handleReplaceAll} title="Replace all">
            <span className="text-[9px] font-semibold tracking-tight">All</span>
          </ToolBtn>
          <div className="ml-auto flex items-center gap-1">
            <ToolBtn
              active={fullscreen}
              onClick={() => setFullscreen((v) => !v)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </ToolBtn>
            <button
              type="button"
              onClick={() => (mode === "visual" ? switchToHtml() : switchToVisual())}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded border px-3 text-[10px] font-semibold uppercase tracking-wider",
                mode === "html"
                  ? "border-luxury-gold bg-luxury-gold/20 text-luxury-gold"
                  : "border-luxury-gold/30 text-white/70 hover:border-luxury-gold/60"
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              Source
            </button>
          </div>
        </div>
      </div>

      <div className={cn("min-h-0 flex-1 overflow-auto", fullscreen && "flex-1")}>
        {mode === "visual" ? (
          <EditorContent editor={editor} />
        ) : (
          <textarea
            value={htmlDraft}
            onChange={(e) => {
              setHtmlDraft(e.target.value);
              onChange(e.target.value);
            }}
            className={cn(
              "min-h-[360px] w-full bg-black/40 px-4 py-3 font-mono text-xs text-white/85 outline-none",
              fullscreen && "h-full min-h-0"
            )}
            spellCheck={false}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-luxury-gold/15 bg-[#0F1C18] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span>
          {words} word{words === 1 ? "" : "s"}
        </span>
        <span>
          {characters} character{characters === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded border text-white/75 transition",
        active
          ? "border-luxury-gold bg-luxury-gold/25 text-luxury-gold"
          : "border-transparent hover:border-luxury-gold/30 hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-luxury-gold/20" aria-hidden />;
}
