"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Plus } from "lucide-react"
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

export interface SearchableSelectProps {
  options: { label: string; value: string }[]
  value?: string
  onValueChange: (value: string) => void
  onCreate?: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
  triggerClassName?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  onCreate,
  placeholder = "Select option...",
  emptyText = "No option found.",
  className,
  triggerClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedOption = React.useMemo(() => 
    options.find((option) => option.value === value),
    [options, value]
  )

  const isNewValue = React.useMemo(() => {
    if (!search) return false
    return !options.some(opt => opt.label.toLowerCase() === search.toLowerCase())
  }, [search, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-11 rounded-xl font-normal bg-background border-input hover:bg-accent/50 transition-colors", triggerClassName)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            className="h-9" 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[250px] overflow-y-auto">
            {isNewValue && onCreate && (
              <CommandGroup heading="New Option">
                <CommandItem
                  value={search}
                  onSelect={(v) => {
                    onCreate(v)
                    setSearch("")
                  }}
                  className="flex items-center gap-2 cursor-pointer py-2.5 px-3 text-primary font-bold"
                >
                  <Plus className="h-4 w-4" />
                  Add "{search}"
                </CommandItem>
              </CommandGroup>
            )}
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{emptyText}</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="flex items-center justify-between cursor-pointer py-2.5 px-3 aria-selected:bg-primary/10 aria-selected:text-primary"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-all",
                      value === option.value ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {value === option.value && <Check className="h-3 w-3" />}
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
