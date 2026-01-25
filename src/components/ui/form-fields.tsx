"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Form Field Wrapper
interface FormFieldWrapperProps {
    label?: string;
    description?: string;
    className?: string;
    children: React.ReactNode;
    error?: string;
}

export function FormFieldWrapper({
    label,
    description,
    className,
    children,
    error,
}: FormFieldWrapperProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label>{label}</Label>}
            {children}
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

// Form Error Message
interface FormErrorProps {
    message?: string;
}

export function FormError({ message }: FormErrorProps) {
    if (!message) return null;
    return (
        <p className="text-xs text-red-500 mt-1">{message}</p>
    );
}

// Form Input Field 
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, description, error, className, ...props }, ref) => {
        return (
            <FormFieldWrapper label={label} description={description} error={error}>
                <Input
                    ref={ref}
                    className={cn(
                        error && "border-red-500",
                        className
                    )}
                    {...props}
                />
            </FormFieldWrapper>
        );
    }
);
FormInput.displayName = "FormInput";

// Form Select Field
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    description?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ label, description, error, options, className, ...props }, ref) => {
        return (
            <FormFieldWrapper label={label} description={description} error={error}>
                <select
                    ref={ref}
                    className={cn(
                        "flex h-10 w-full rounded-md border-2 border-black bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-0 focus-visible:translate-y-[2px] focus-visible:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-500",
                        className
                    )}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </FormFieldWrapper>
        );
    }
);
FormSelect.displayName = "FormSelect";
