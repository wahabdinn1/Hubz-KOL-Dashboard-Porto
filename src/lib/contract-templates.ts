export interface CampaignTemplate {
    id: string;
    name: string;
    description: string;
    content: string; // Tiptap HTML/JSON content
}

export const CONTRACT_TEMPLATES: CampaignTemplate[] = [
    {
        id: "tpl_standard_agreement",
        name: "Standard KOL Agreement",
        description: "Standard paid collaboration agreement",
        content: `
            <h2>INFLUENCER MARKETING AGREEMENT</h2>
            <p><strong>Date:</strong> {TODAY_DATE}</p>
            <p><strong>Contract No:</strong> {CONTRACT_NUMBER}</p>
            
            <h3>1. PARTIES</h3>
            <p>This Agreement is entered into by and between:</p>
            <p><strong>Company:</strong> {BRAND_NAME}</p>
            <p><strong>Influencer:</strong> {KOL_NAME} (NIK: {KOL_NIK})</p>
            <p><strong>Address:</strong> {KOL_ADDRESS}</p>

            <h3>2. SCOPE OF WORK</h3>
            <p>The Influencer agrees to produce and post the following content:</p>
            <p>{SOW}</p>

            <h3>3. TIMELINE</h3>
            <p><strong>Start Date:</strong> {START_DATE}</p>
            <p><strong>End Date:</strong> {END_DATE}</p>

            <h3>4. COMPENSATION</h3>
            <p>The Company agrees to pay the Influencer a total fee of <strong>{FEE_AMOUNT}</strong>.</p>
            <p><strong>Payment Terms:</strong> {PAYMENT_TERMS}</p>

            <h3>5. RIGHTS & USAGE</h3>
            <p>The Influencer grants the Company a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute the Content for marketing purposes for a period of 12 months.</p>

            <br/>
            <br/>
            <hr/>
            <p><strong>Signed by:</strong></p>
            <br/>
            <br/>
            <p>__________________________</p>
            <p>{KOL_NAME}</p>
        `
    },
    {
        id: "tpl_affiliate",
        name: "Affiliate Commission Agreement",
        description: "Commission-based partnership",
        content: `
            <h2>AFFILIATE PARTNERSHIP AGREEMENT</h2>
            <p><strong>Date:</strong> {TODAY_DATE}</p>
            
            <h3>1. PARTIES</h3>
            <p><strong>Company:</strong> {BRAND_NAME}</p>
            <p><strong>Partner:</strong> {KOL_NAME}</p>

            <h3>2. COMMISSION STRUCTURE</h3>
            <p>The Partner will receive a commission of <strong>{COMMISSION_RATE}%</strong> on all net sales generated through their unique tracking link/code.</p>

            <h3>3. PAYMENT</h3>
            <p>Commissions are paid monthly, net 30.</p>

            <br/>
            <br/>
            <p>__________________________</p>
            <p>{KOL_NAME}</p>
        `
    }
];

export const CONTRACT_VARIABLES = [
    { label: "KOL Name", value: "{KOL_NAME}", description: "Full legal name of the influencer" },
    { label: "KOL NIK", value: "{KOL_NIK}", description: "KOL's National ID Number" },
    { label: "KOL Address", value: "{KOL_ADDRESS}", description: "Residential address" },
    { label: "Brand Name", value: "{BRAND_NAME}", description: "Legal entity name of the brand" },
    { label: "Fee Amount", value: "{FEE_AMOUNT}", description: "Agreed payment amount" },
    { label: "Scope of Work", value: "{SOW}", description: "Deliverables description" },
    { label: "Payment Terms", value: "{PAYMENT_TERMS}", description: "e.g. Net 30, Upon Completion" },
    { label: "Start Date", value: "{START_DATE}", description: "Campaign start date" },
    { label: "End Date", value: "{END_DATE}", description: "Campaign end date" },
    { label: "Today's Date", value: "{TODAY_DATE}", description: "Current date for signing" },
    { label: "Contract Number", value: "{CONTRACT_NUMBER}", description: "Unique generated contract ID" },
];

export function hydrateContract(content: string, variables: Record<string, unknown>): string {
    let text = content;
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        text = text.replace(regex, String(variables[key] || "________________"));
    });
    return text;
}

