import { useMemo, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type SitemapXmlPanelProps = {
  contentType: string | null;
  fetchedAt: string | null;
  rawXml: string;
};

const SitemapXmlPanel = ({ contentType, fetchedAt, rawXml }: SitemapXmlPanelProps) => {
  const [open, setOpen] = useState(false);

  const fileName = useMemo(() => {
    if (!fetchedAt) return "sitemap.xml";
    return `sitemap-${fetchedAt.replace(/[:.]/g, "-")}.xml`;
  }, [fetchedAt]);

  const handleDownload = () => {
    const blob = new Blob([rawXml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Raw sitemap.xml response</CardTitle>
          <CardDescription>
            {contentType ? `Content-Type: ${contentType}` : "Displays the exact response body fetched from /sitemap.xml."}
          </CardDescription>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownload} disabled={!rawXml}>
          <Download className="h-4 w-4" />
          Download XML
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="max-h-48 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs text-foreground whitespace-pre-wrap break-all">
          {rawXml || "No response body returned."}
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-0 hover:bg-transparent">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
              {open ? "Hide XML preview" : "Show XML preview"}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <pre className="max-h-[32rem] overflow-auto rounded-md border bg-background p-4 font-mono text-xs leading-6 text-foreground whitespace-pre-wrap break-all">
              {rawXml || "No response body returned."}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SitemapXmlPanel;