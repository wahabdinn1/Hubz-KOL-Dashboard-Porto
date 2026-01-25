"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Minus } from "lucide-react"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'> {
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef
    
    const isChecked = checked === true
    const isIndeterminate = checked === "indeterminate"
    
    React.useEffect(() => {
      if (combinedRef.current) {
        combinedRef.current.indeterminate = isIndeterminate
      }
    }, [isIndeterminate, combinedRef])

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onCheckedChange?.(!isChecked)
    }

    return (
      <div 
        className="relative inline-flex items-center"
        onClick={handleClick}
        role="checkbox"
        aria-checked={isIndeterminate ? "mixed" : isChecked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onCheckedChange?.(!isChecked)
          }
        }}
      >
        <input
          type="checkbox"
          className="sr-only"
          ref={combinedRef}
          checked={isChecked}
          onChange={() => onCheckedChange?.(!isChecked)}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-black ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            (isChecked || isIndeterminate) && "bg-black text-white",
            "flex items-center justify-center cursor-pointer",
            className
          )}
        >
          {isChecked && <Check className="h-3 w-3" />}
          {isIndeterminate && <Minus className="h-3 w-3" />}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
