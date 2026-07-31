// mirrors backend Proposal

export type ProposalKind = 'NEW_CLIENT' | 'EXISTING_PROJECT';
export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type IngestChannel = 'TEXT' | 'VOICE';

export interface ProposalDto {
    id : string,
    targetProjectId : string | null,
    kind : ProposalKind,
    status : ProposalStatus,
    sourceChannel : IngestChannel,
    sourceText : string,
    // Shape depends on kind, so it has to be narrowed at the point of use.
    payload : unknown,
    summary : string,
    createdAt : string,
    decidedAt : string | null,
}
