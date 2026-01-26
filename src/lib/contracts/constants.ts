export const CONTRACT_VARIABLES = [
    { label: "KOL Name", value: "{KOL_NAME}", description: "Full name of the influencer" },
    { label: "KOL NIK", value: "{KOL_NIK}", description: "National ID Number" },
    { label: "KOL Address", value: "{KOL_ADDRESS}", description: "Residential address" },
    { label: "Brand Name", value: "{BRAND_NAME}", description: "Name of the contracting brand" },
    { label: "Fee Amount", value: "{FEE_AMOUNT}", description: "Total payment fee (IDR)" },
    { label: "Scope of Work", value: "{SOW}", description: "List of videos/posts required" },
    { label: "Payment Terms", value: "{PAYMENT_TERMS}", description: "Net 30, 50% Upfront, etc." },
    { label: "Start Date", value: "{START_DATE}", description: "Campaign start date" },
    { label: "End Date", value: "{END_DATE}", description: "Campaign end date" },
    { label: "Today Date", value: "{TODAY_DATE}", description: "Current date for signing" },
] as const;

export type ContractVariable = typeof CONTRACT_VARIABLES[number]['value'];
