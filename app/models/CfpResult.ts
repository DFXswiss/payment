enum ResultStatus {
  APPROVED = "Approved",
  NOT_APPROVED = "Not approved",
}

export interface CfpResult {
  title: string;
  number: number;
  yes: number;
  neutral: number;
  no: number;
  votes: number;
  possibleVotes: number;
  voteTurnout: number;
  currentResult: ResultStatus;
}
