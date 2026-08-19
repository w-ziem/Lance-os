//mirrors backend ScopeItem

export type ScopeItemSource = 'MANUAL' | 'AI';


export interface CreateScopeItemRequest {
   name : string;
   description? : string;
   estimateHours : number;
}

export interface ScopeItemDto {
    id : string,
    projectId : string,
    name : string,
    description : string | null,
    estimateHours : number,
    position : number,
    source : ScopeItemSource,
    createdAt : string,
    updatedAt : string,
}

export interface UpdateScopeItemRequest {
    name? : string,
    description? : string,
    estimateHours? : number,
}

// Valuation read model. Every money field is null when the input it depends on
// is missing — no hourly rate means no value, no budget means no difference.
export interface ScopeSummaryDto {
    itemCount : number,
    totalHours : number,
    hourlyRate : number | null,
    totalValue : number | null,
    budget : number | null,
    difference : number | null,
    overBudget : boolean,
}
