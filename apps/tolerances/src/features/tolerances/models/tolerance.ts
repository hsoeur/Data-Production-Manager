export type ToleranceMode = 'Between' | 'Equal' | 'Min' | 'Max' | 'Record' | 'Entry';

export type Tolerance = {
  toleranceUid: string;
  productUid: string;
  operationNumber: number;
  machineUid: string;
  label: string;
  mode: ToleranceMode;
  val1: string;
  val2: string;
  unitUid: string;
  userUid: string;
  startDate: string;
  endDate: string;
};

export type ToleranceInput = Omit<Tolerance, 'toleranceUid'>;

export type Machine = {
  machineUid: string;
  label: string;
};

export type CopyToleranceBatchRequest = {
  sourceProductUid: string;
  targetProductUid: string;
  toleranceUids: string[];
  startDate: string;
  endDate: string;
  userUid: string;
};

export type CopyToleranceBatchResponse = {
  sourceProductUid: string;
  targetProductUid: string;
  createdCount: number;
  tolerances: Tolerance[];
};
