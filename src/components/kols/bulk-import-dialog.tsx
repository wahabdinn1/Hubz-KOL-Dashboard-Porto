"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useData } from "@/context/data-context";
import { KOL } from "@/lib/static-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CSVRow {
    name: string;
    category: string;
    followers: string;
    avgViews: string;
    rateCardTiktok: string;
    rateCardReels: string;
}

interface ParsedKOL {
    data: Partial<KOL>;
    isValid: boolean;
    errors: string[];
}

export function BulkImportDialog() {
    const [open, setOpen] = React.useState(false);
    const [parsedData, setParsedData] = React.useState<ParsedKOL[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [step, setStep] = React.useState<"upload" | "preview" | "importing">("upload");
    const { addKOL } = useData();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const parseCSV = (text: string): CSVRow[] => {
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
        const rows: CSVRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
            const row: Record<string, string> = {};

            headers.forEach((header, idx) => {
                row[header] = values[idx] || "";
            });

            rows.push(row as unknown as CSVRow);
        }

        return rows;
    };

    const validateAndParse = (rows: CSVRow[]): ParsedKOL[] => {
        return rows.map((row) => {
            const errors: string[] = [];

            if (!row.name || row.name.trim() === "") {
                errors.push("Name required");
            }

            if (!row.category || row.category.trim() === "") {
                errors.push("Category required");
            }

            const followers = parseInt(row.followers?.replace(/[^0-9]/g, "") || "0", 10);
            if (isNaN(followers) || followers <= 0) {
                errors.push("Invalid followers");
            }

            const avgViews = parseInt(row.avgViews?.replace(/[^0-9]/g, "") || "0", 10);
            const rateCardTiktok = parseInt(row.rateCardTiktok?.replace(/[^0-9]/g, "") || "0", 10);
            const rateCardReels = parseInt(row.rateCardReels?.replace(/[^0-9]/g, "") || "0", 10);

            const validCategories = ["Beauty", "Fashion", "Tech", "Food", "Travel", "Lifestyle", "Gaming", "Fitness", "Education", "Entertainment"];
            const category = validCategories.find((c) => c.toLowerCase() === row.category?.toLowerCase()) || row.category;

            // Determine tier based on followers
            let type: "Nano" | "Micro" | "Macro" | "Mega" = "Nano";
            if (followers >= 1000000) type = "Mega";
            else if (followers >= 100000) type = "Macro";
            else if (followers >= 10000) type = "Micro";

            return {
                data: {
                    id: `kol_import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: row.name?.trim() || "",
                    type,
                    category: category || "Lifestyle",
                    followers,
                    avgViews,
                    rateCardTiktok,
                    rateCardReels,
                },
                isValid: errors.length === 0,
                errors,
            };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const rows = parseCSV(text);
            const parsed = validateAndParse(rows);
            setParsedData(parsed);
            setStep("preview");
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        setStep("importing");
        setIsLoading(true);

        const validKOLs = parsedData.filter((p) => p.isValid);
        let successCount = 0;

        for (const kol of validKOLs) {
            try {
                await addKOL(kol.data as KOL, false);
                successCount++;
            } catch (error) {
                console.error("Failed to import KOL:", kol.data.name, error);
            }
        }

        setIsLoading(false);
        toast.success(`Successfully imported ${successCount} influencers`);
        handleReset();
        setOpen(false);
    };

    const handleReset = () => {
        setParsedData([]);
        setStep("upload");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validCount = parsedData.filter((p) => p.isValid).length;
    const invalidCount = parsedData.filter((p) => !p.isValid).length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                    <Upload className="h-3 w-3" />
                    Bulk Import
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Bulk Import Influencers
                    </DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to import multiple influencers.
                    </DialogDescription>
                </DialogHeader>

                {step === "upload" && (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                            Drop your CSV file here, or click to browse
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <Button asChild variant="outline">
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                Select CSV File
                            </label>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                            Required: name, category, followers, avgViews, rateCardTiktok, rateCardReels
                        </p>
                    </div>
                )}

                {step === "preview" && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1 text-sm text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {validCount} valid
                                </span>
                                {invalidCount > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-red-500">
                                        <AlertCircle className="h-4 w-4" />
                                        {invalidCount} errors
                                    </span>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleReset}>
                                <X className="h-4 w-4 mr-1" />
                                Reset
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">Status</th>
                                        <th className="p-2 text-left">Name</th>
                                        <th className="p-2 text-left">Category</th>
                                        <th className="p-2 text-left">Followers</th>
                                        <th className="p-2 text-left">Avg Views</th>
                                        <th className="p-2 text-left">Errors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((item, idx) => (
                                        <tr
                                            key={idx}
                                            className={cn(
                                                "border-t",
                                                !item.isValid && "bg-red-50 dark:bg-red-950/20"
                                            )}
                                        >
                                            <td className="p-2">
                                                {item.isValid ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                )}
                                            </td>
                                            <td className="p-2 font-medium">{item.data.name}</td>
                                            <td className="p-2">{item.data.category}</td>
                                            <td className="p-2">{item.data.followers?.toLocaleString()}</td>
                                            <td className="p-2">{item.data.avgViews?.toLocaleString()}</td>
                                            <td className="p-2 text-red-500 text-xs">
                                                {item.errors.join(", ")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {step === "importing" && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                        <p className="text-sm text-muted-foreground">Importing...</p>
                    </div>
                )}

                <DialogFooter>
                    {step === "preview" && (
                        <>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={validCount === 0 || isLoading}
                            >
                                Import {validCount} Influencer{validCount !== 1 ? "s" : ""}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
