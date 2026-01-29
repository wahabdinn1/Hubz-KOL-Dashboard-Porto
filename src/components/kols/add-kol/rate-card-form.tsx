import { CurrencyInput } from "@/components/ui/currency-input";
import { FormInput } from "@/components/ui/form-fields";
import { Label } from "@/components/ui/label";
import { AnyFieldApi } from "@tanstack/react-form";

interface RateCardFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
}

export function RateCardForm({ form }: RateCardFormProps) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <form.Subscribe selector={(state: any) => state.values.collaborationType}>
            {(collaborationType: string) => (
                collaborationType === 'PAID' && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rate Card (IDR)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="rateCardTiktok">
                                {(field: AnyFieldApi) => (
                                    <div className="space-y-2">
                                        <Label>TikTok Video</Label>
                                        <CurrencyInput 
                                            value={field.state.value || ""} 
                                            onValueChange={(val) => field.handleChange(val.toString())} 
                                            placeholder="0" 
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field name="rateCardReels">
                                {(field: AnyFieldApi) => (
                                    <div className="space-y-2">
                                        <Label>IG Reels</Label>
                                        <CurrencyInput 
                                            value={field.state.value || ""} 
                                            onValueChange={(val) => field.handleChange(val.toString())} 
                                            placeholder="0" 
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field name="rateCardPdfLink">
                                {(field: AnyFieldApi) => (
                                    <div className="space-y-2">
                                        <FormInput
                                            label="PDF Rate Card (URL)"
                                            value={field.state.value || ""}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                    </div>
                )
            )}
        </form.Subscribe>
    );
}
