export type LabelTemplate = {
  labelTemplateUid: string;
  product: string;
  labelTypeUid: string;
  templateFile: string;
  photo: string;
  startDate: string;
  endDate: string;
  userUid: string;
};

export type LabelTemplateInput = Omit<LabelTemplate, 'labelTemplateUid'>;
export type LabelType = { labelTypeUid: string };
