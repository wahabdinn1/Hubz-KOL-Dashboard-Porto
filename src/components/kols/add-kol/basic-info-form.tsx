import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput, FormSelect } from "@/components/ui/form-fields";
import { Label } from "@/components/ui/label";
import { useData } from "@/context/data-context";
import { AnyFieldApi } from "@tanstack/react-form";

interface BasicInfoFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    setDuplicateWarning: (warning: string | null) => void;
    currentKolId?: string;
}

export function BasicInfoForm({ form, setDuplicateWarning, currentKolId }: BasicInfoFormProps) {
    const { kols, categories } = useData();

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
            
            {/* Avatar */}
            <div className="flex items-center gap-4">
                <form.Field name="avatar">
                    {(field: AnyFieldApi) => (
                        <>
                            <Avatar className="h-16 w-16 border">
                                {field.state.value ? <AvatarImage src={field.state.value} /> : null}
                                <AvatarFallback>K</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 flex-1">
                                <FormInput
                                    label="Avatar URL"
                                    description="Enter a URL or fetch from TikTok to auto-fill."
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <form.Field name="name">
                    {(field: AnyFieldApi) => (
                        <FormInput
                            label="Full Name"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={() => {
                                const exists = kols.some(k => 
                                    k.name.toLowerCase() === field.state.value.trim().toLowerCase() && 
                                    k.id !== currentKolId
                                );
                                setDuplicateWarning(exists ? `"${field.state.value}" already exists.` : null);
                                field.handleBlur();
                            }}
                            error={field.state.meta.errors ? field.state.meta.errors.join(", ") : undefined}
                            required
                        />
                    )}
                </form.Field>

                <form.Field name="categoryId">
                    {(field: AnyFieldApi) => (
                        categories.length > 0 ? (
                            <FormSelect
                                label="Category"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                options={categories.map(c => ({ value: c.id, label: c.name }))}
                                error={field.state.meta.errors ? field.state.meta.errors.join(", ") : undefined}
                            />
                        ) : (
                            <FormInput
                                label="Category ID"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        )
                    )}
                </form.Field>

                <form.Field name="whatsappNumber">
                    {(field: AnyFieldApi) => (
                        <FormInput
                            label="WhatsApp Number"
                            placeholder="628xxxxxxxxxx"
                            description="Format: 628xxxxxxxxxx (no + or spaces)"
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    )}
                </form.Field>
            </div>

            {/* Collaboration Type Selector */}
            <form.Field name="collaborationType">
                {(field: AnyFieldApi) => (
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-sm font-semibold">Collaboration Type</Label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => field.handleChange("PAID")}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-sm font-bold ${
                                    field.state.value === 'PAID'
                                        ? 'border-black bg-primary text-primary-foreground shadow-hard-sm'
                                        : 'border-muted bg-transparent hover:border-black/50 text-muted-foreground'
                                }`}
                            >
                                PAID
                                <span className="block text-[10px] font-normal mt-1 opacity-80">Fixed rate card pricing</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => field.handleChange("AFFILIATE")}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-sm font-bold ${
                                    field.state.value === 'AFFILIATE'
                                        ? 'border-black bg-primary text-primary-foreground shadow-hard-sm'
                                        : 'border-muted bg-transparent hover:border-black/50 text-muted-foreground'
                                }`}
                            >
                                AFFILIATE
                                <span className="block text-[10px] font-normal mt-1 opacity-80">Commission-based</span>
                            </button>
                        </div>
                    </div>
                )}
            </form.Field>
        </div>
    );
}
