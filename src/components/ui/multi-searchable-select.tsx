"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface MultiSearchableSelectProps {
  options: { label: string; value: string }[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
}

export function MultiSearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select options...",
  emptyText = "No option found.",
  className,
}: MultiSearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onValueChange(value.filter((i) => i !== item))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-11 rounded-xl font-normal bg-background border-input hover:bg-accent/50 transition-colors py-2", className)}
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((val) => {
                const opt = options.find((o) => o.value === val)
                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="rounded-lg px-2 py-0 h-6 flex items-center gap-1 group/badge"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnselect(val)
                    }}
                  >
                    {opt?.label || val}
                    <X className="h-3 w-3 text-muted-foreground group-hover/badge:text-foreground" />
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-9" />
          <CommandList className="max-h-[250px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{emptyText}</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    const newValue = value.includes(option.value)
                      ? value.filter((v) => v !== option.value)
                      : [...value, option.value]
                    onValueChange(newValue)
                  }}
                  className="flex items-center justify-between cursor-pointer py-2.5 px-3 aria-selected:bg-primary/10 aria-selected:text-primary"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-all",
                      value.includes(option.value) ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {value.includes(option.value) && <Check className="h-3 w-3" />}
                    </div>
                    <span className="truncate font-medium">{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
