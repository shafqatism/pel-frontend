"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface ImportPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: any[]
  columns: string[]
  onConfirm: () => void
  isLoading?: boolean
  title?: string
  description?: string
}

export function ImportPreviewModal({
  open,
  onOpenChange,
  data,
  columns,
  onConfirm,
  isLoading,
  title = "Preview Import Data",
  description = "Please review the data below before proceeding with the import to the database.",
}: ImportPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-border/50 shadow-2xl">
        <div className="p-6 pb-4 border-b border-border/40">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="relative h-full overflow-auto p-6 pt-2">
            <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/20">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent">
                    {columns.map((col) => (
                      <TableHead key={col} className="text-[10px] font-black uppercase tracking-wider h-10">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((row, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                        {columns.map((col) => (
                          <TableCell key={col} className="text-xs font-medium py-3">
                            {row[col]?.toString() || "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                        No data found in the file.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{data.length} Records Found</span>
             </div>
             {data.length > 100 && (
                <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Large Dataset</span>
                </div>
             )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl font-bold px-6 border-border/60 hover:bg-background"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || data.length === 0}
              className="rounded-xl font-bold px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                "Proceed to Import"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
