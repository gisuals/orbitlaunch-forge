import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, TrendingUp, Image, Settings, Check } from "lucide-react";
import { CHAIN_TEMPLATES, type ChainTemplate } from "@/config/templates";
import { cn } from "@/lib/utils";

const iconMap = {
  Gamepad2,
  TrendingUp,
  Image,
  Settings,
};

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onSelect: (template: ChainTemplate) => void;
}

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-configured template optimized for your use case, then customize as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHAIN_TEMPLATES.map((template) => {
          const Icon = iconMap[template.icon as keyof typeof iconMap];
          const isSelected = selectedTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
                isSelected && "border-primary border-2 bg-primary/5"
              )}
              onClick={() => onSelect(template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {template.name}
                      {template.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </h4>
                  </div>
                </div>
                {isSelected && (
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {template.config.features && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Key Features:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {template.config.features.slice(0, 3).map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                className="w-full mt-4"
                variant={isSelected ? "default" : "outline"}
                size="sm"
              >
                {isSelected ? "Selected" : "Use Template"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
