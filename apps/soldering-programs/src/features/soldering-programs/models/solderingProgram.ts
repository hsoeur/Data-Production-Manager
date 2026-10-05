export type SolderingSide = 'FC' | 'FS';

export type SolderingProgram = {
  solderingProgramUid: string;
  productUid: string;
  program: number;
  startDate: string;
  endDate: string;
  userUid: string;
  side: SolderingSide;
};

export type SolderingProgramCreateInput = Pick<SolderingProgram, 'productUid' | 'program' | 'userUid' | 'side'>;
