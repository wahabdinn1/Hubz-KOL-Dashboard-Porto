"use client";

import { useSearchParams } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
// import { zodValidator } from "@tanstack/zod-form-adapter"; 
import * as z from "zod";
import { Calculator, AlertCircle, TrendingUp, Eye, Layers, BarChart3, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateCPM, getVerdict, formatCurrency, calculateAverage, calculateMedian } from "@/lib/scorecard-utils";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useData } from "@/context/data-context";

// Validation Schema
const scorecardSchema = z.object({
  username: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  // views: z.coerce.number().min(0, "Views must be at least 0"), // Replaced by recentViews
  recentViews: z.array(z.coerce.number().min(0)).length(10),
  slots: z.coerce.number().min(1, "Slots must be at least 1"),
});

type ScorecardValues = z.infer<typeof scorecardSchema>;

export default function KolScorecardPage() {
  const searchParams = useSearchParams();
  const initialUsername = searchParams.get("username") || "";
  const { kols } = useData();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      username: initialUsername,
      price: 0,
      recentViews: Array(10).fill(0), // Initialize with 10 zeros
      slots: 1,
    } as ScorecardValues,
    // validatorAdapter: zodValidator(), // Commenting out to fix build type error
    validators: {
      onChange: ({ value }) => {
        const result = scorecardSchema.safeParse(value);
        if (!result.success) {
            return undefined; 
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  // Real-time calculation using useStore
  const values = useStore(form.store, (state) => state.values);

  // Derived state (no useEffect needed)
  const result = (() => {
    const { price, recentViews, slots } = values;
    if (price > 0) {
       const avgView = calculateAverage(recentViews);
       const medianView = calculateMedian(recentViews);
       
       const avgCpm = calculateCPM(price, avgView);
       const medianCpm = calculateCPM(price, medianView);
 
       return {
         avgView,
         medianView,
         avgCpm,
         medianCpm,
         avgVerdict: getVerdict(avgCpm),
         medianVerdict: getVerdict(medianCpm),
         totalCost: price * (slots || 1),
       };
    }
    return null;
  })();

  const formatNumber = (val: number) => {
    if (!val) return "";
    return new Intl.NumberFormat("en-US").format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">KOL Scorecard Calculator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INPUT (Span 5) */}
        <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <Card className="border-2 border-black shadow-hard">
            <CardHeader className="border-b-2 border-black bg-muted/20">
                <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Input Data
                </CardTitle>
                <CardDescription>
                Enter the KOL&apos;s rate card and 10 recent video views.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
                >
                <form.Field name="username">
                    {(field) => (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>Username / Influencer</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between border-2 border-black shadow-hard-sm"
                                >
                                    {field.state.value || "Select or enter username..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search influencer or type..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="p-2 text-sm text-center">
                                                No influencer found.
                                                {/* Allow manual selection if search doesn't match */}
                                                <Button 
                                                    key="manual-use"
                                                    variant="ghost" 
                                                    className="mt-2 w-full h-auto py-1 text-xs"
                                                    onClick={() => {
                                                        // We can't easily grab the input value here in shadcn command without some state hack or ref.
                                                        // Alternative: The user sees this when searching. 
                                                        // If they want to use what they typed, they are kind of stuck unless we handle onValueChange on CommandInput.
                                                        // Shadcn Command usually filters.
                                                        // Let's rely on a custom item that always shows?
                                                        // Or just 'No results found' and user has to type in a normal input? 
                                                        // User asked for "choose from influencer pages OR input manually".
                                                    }}
                                                >
                                                   Tip: Select from list or type below
                                                </Button>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup heading="Influencers">
                                            {kols.map((kol) => (
                                                <CommandItem
                                                    key={kol.id}
                                                    value={kol.name + (kol.tiktokUsername ? ` @${kol.tiktokUsername}` : "")} // Searchable string
                                                    onSelect={() => {
                                                        const handle = kol.tiktokUsername || kol.instagramUsername || kol.name;
                                                        field.handleChange(handle);
                                                        // Optional: Auto-fill price
                                                        if (kol.rateCardTiktok) {
                                                            form.setFieldValue("price", kol.rateCardTiktok);
                                                        }
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.state.value === (kol.tiktokUsername || kol.instagramUsername || kol.name)
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{kol.name}</span>
                                                        <span className="text-xs text-muted-foreground">@{kol.tiktokUsername || kol.instagramUsername || "no-handle"}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                            {/* Custom Input Option: Always show generic or create based on search? 
                                                Shadcn Command doesn't expose the search query easily to children. 
                                                We'll add a 'Manual Input' field inside the popover if needed, OR just tell them to use the list.
                                                Actually, if they want to type manually, `CommandInput` is for filtering.
                                                
                                                BETTER UX for "Manual OR Select": 
                                                If they type "john", show "Create 'john'"?
                                                This requires controlled command input state.
                                            */}
                                        </CommandGroup>
                                        
                                        {/* Hack for manual entry: Using a "Manual Entry" item that sets the value to whatever the user has typed? 
                                            Currently tricky with standard Command component. 
                                            
                                            Let's switch approach slightly:
                                            If they type something and press Enter, it should use that value.
                                            Shadcn/cmdk `CommandInput` doesn't pass `onValueChange` up easily to create items dynamically without state.
                                        */}
                                    </CommandList>
                                    {/* Workaround: Add a separate input area for manual if not found? 
                                        Or keep it simple: If they can't find it, they likely need to type it.
                                        Maybe just adding a standard Input field below/above the select?
                                        
                                        User said: "username user can input manually OR choose from influencer pages"
                                        
                                        Let's add a "Manual Input" state/mode?
                                        Or just a simple Input field that has a "Search" button that opens the popover?
                                    */}
                                </Command>
                                <div className="p-2 border-t">
                                     <Label className="text-xs text-muted-foreground mb-1 block">Manual Input (if not in list)</Label>
                                     <Input 
                                        placeholder="Type username..." 
                                        className="h-8 text-sm"
                                        value={field.state.value} 
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setOpen(false);
                                        }}
                                     />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    )}
                </form.Field>

                <div className="grid grid-cols-2 gap-4">
                    <form.Field name="price">
                        {(field) => (
                        <div className="space-y-2">
                            <Label htmlFor={field.name}>Price / Rate (IDR)</Label>
                            <div className="relative">
                                {/* Replaced DollarSign with Rp text */}
                                <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">Rp</span>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    id={field.name}
                                    name={field.name}
                                    value={formatNumber(field.state.value)}
                                    // Removed onBlur={field.handleBlur} to avoid formatting issues on blur if needed, but handled by formatNumber
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                        field.handleChange(Number(rawValue));
                                    }}
                                    placeholder="1,000,000"
                                    className="pl-9 border-2 border-black shadow-hard-sm"
                                />
                            </div>
                        </div>
                        )}
                    </form.Field>

                    <form.Field name="slots">
                        {(field) => (
                        <div className="space-y-2">
                            <Label htmlFor={field.name}>Slots</Label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    placeholder="1"
                                    className="pl-9 border-2 border-black shadow-hard-sm"
                                />
                            </div>
                        </div>
                        )}
                    </form.Field>
                </div>

                <div className="space-y-3 pt-2">
                    <Label className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Recent Video Views (Last 10)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <form.Field key={index} name={`recentViews[${index}]`}>
                                {(field) => (
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground ml-1">Video {index + 1}</Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder={`0`}
                                            value={formatNumber(field.state.value)}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.handleChange(Number(rawValue));
                                            }}
                                            className="border-2 border-black/20 focus:border-black transition-colors text-right"
                                        />
                                    </div>
                                )}
                            </form.Field>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Enter views for the last 10 videos to calculate Avg & Median.</p>
                </div>
                </form>
            </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN: SCORECARD (Span 7) */}
        <div className="md:col-span-7 space-y-6">
            {/* MAIN SCORECARD */}
            <Card className="border-2 border-black shadow-hard overflow-hidden">
                <CardHeader className="border-b-2 border-black bg-black text-white">
                    <CardTitle className="flex justify-between items-center">
                        <span>Scorecard Analysis</span>
                        {result && (
                            <span className={`text-sm px-3 py-1 rounded-full font-bold border border-white ${result.medianVerdict.color} ${result.medianVerdict.textColor}`}>
                                {result.medianVerdict.label}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {!result ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <AlertCircle className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Enter price and recent views to generate analysis</p>
                            <p className="text-sm">We&apos;ll calculate Median and Average performance</p>
                        </div>
                    ) : (
                        <div>
                           {/* MEDIAN ANALYSIS (PRIMARY) */}
                           <div className="p-6 bg-yellow-50/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-black text-white rounded-md">
                                        <BarChart3 className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-bold text-lg uppercase tracking-tight">Median Analysis (Primary)</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Median Views</p>
                                        <p className="text-2xl font-bold mt-1">{formatCurrency(result.medianView).replace('Rp', '')}</p> 
                                        {/* Removing Rp for views, cleaner. Usually formatNumber is better but formatCurrency adds . separators nicely. Let's use formatNumber actually if we had it exported, or just replace. */}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Median CPM</p>
                                                <p className="text-3xl font-black mt-1">{formatCurrency(result.medianCpm)}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg border-2 border-black ${result.medianVerdict.color} font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                                                {result.medianVerdict.label}
                                            </div>
                                        </div>
                                        <Separator className="my-3 bg-black/10" />
                                        <p className="text-sm text-slate-700 leading-tight">{result.medianVerdict.description}</p>
                                    </div>
                                </div>
                           </div>

                           <Separator className="bg-black" />

                           {/* AVERAGE ANALYSIS (SECONDARY) */}
                           <div className="p-6 bg-slate-50">
                                <div className="flex items-center gap-2 mb-4 opacity-70">
                                    <TrendingUp className="h-4 w-4" />
                                    <h3 className="font-bold text-lg uppercase tracking-tight">Average Analysis</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-80">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Avg Views</p>
                                        <p className="text-xl font-bold mt-1">{formatCurrency(result.avgView).replace('Rp', '')}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Avg CPM</p>
                                                <p className="text-2xl font-bold mt-1">{formatCurrency(result.avgCpm)}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded border border-black/20 ${result.avgVerdict.color} dark:text-black`}>
                                                {result.avgVerdict.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                           </div>
                           
                           <Separator className="bg-black/10" />

                           <div className="p-4 bg-muted/20 text-right">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Est. Cost</p>
                                <p className="text-xl font-black mt-1 text-slate-700">{formatCurrency(result.totalCost)}</p>
                                <p className="text-[10px] text-muted-foreground">For {values.slots} slot(s)</p>
                           </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Benchmarks Legend */}
            <Card className="border-2 border-black shadow-hard-sm">
                <CardHeader className="py-2 bg-muted/30 border-b-2 border-black">
                    <CardTitle className="text-xs font-bold uppercase">CPM Benchmarks (IDR)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-5 divide-x-2 divide-black/10 text-xs">
                        <div className="p-2 text-center bg-[#A3E635]/20">
                            <span className="block font-bold">SUPER WORTH IT</span>
                            <span className="block text-muted-foreground">&lt; 1k</span>
                        </div>
                        <div className="p-2 text-center bg-[#60A5FA]/20">
                            <span className="block font-bold">GOOD</span>
                            <span className="block text-muted-foreground">&lt; 5k</span>
                        </div>
                        <div className="p-2 text-center bg-[#FACC15]/20">
                            <span className="block font-bold">STANDARD</span>
                            <span className="block text-muted-foreground">&lt; 15k</span>
                        </div>
                        <div className="p-2 text-center bg-[#FB923C]/20">
                            <span className="block font-bold">NEEDS IMPROVEMENT</span>
                            <span className="block text-muted-foreground">&lt; 25k</span>
                        </div>
                        <div className="p-2 text-center bg-[#F87171]/20">
                            <span className="block font-bold">OVERPRICED</span>
                            <span className="block text-muted-foreground">&ge; 25k</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
