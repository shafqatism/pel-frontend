import { Construction } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface PlaceholderViewProps {
  title: string
  description: string
  icon: LucideIcon
  badge?: string
}

export function PlaceholderView({ title, description, icon: Icon, badge = "In Development" }: PlaceholderViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className="ml-auto rounded-full px-3 text-xs font-semibold">
          {badge}
        </Badge>
      </div>

      <Card className="rounded-2xl border-border/50 border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-muted/50">
            <Construction className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-bold text-base text-foreground">{title} module</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              This module is ready to be connected to the PEL backend API. Implementation coming soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
