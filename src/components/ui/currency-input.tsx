"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: number | string;
    onValueChange: (value: number) => void;
}

export function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
    // Format number with dots
    const formatNumber = (num: number | string) => {
        if (!num) return "";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const [displayValue, setDisplayValue] = React.useState(formatNumber(value));

    // Update display value when prop changes externally
    React.useEffect(() => {
        setDisplayValue(formatNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Remove non-digits
        const rawValue = val.replace(/\D/g, "");

        // Update display with formatting
        setDisplayValue(formatNumber(rawValue));

        // Pass parent the raw number
        onValueChange(Number(rawValue));
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={className}
        />
    );
}
