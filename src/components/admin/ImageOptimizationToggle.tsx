import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ImageOptimizationToggleProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const ImageOptimizationToggle = ({
  checked,
  disabled = false,
  onCheckedChange,
}: ImageOptimizationToggleProps) => {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="min-w-0">
        <Label htmlFor="optimize-images-toggle" className="text-xs font-medium text-foreground">
          Convert to WebP when smaller
        </Label>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Optimizes JPG and PNG uploads for faster loading while keeping the original dimensions.
        </p>
      </div>
      <Switch
        id="optimize-images-toggle"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
};

export default ImageOptimizationToggle;