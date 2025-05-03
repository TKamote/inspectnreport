export interface HeaderData {
  company: string;
  createdBy: string;
  reportFor: string;
  typeOfReport: string;
  date: string;
  // 'contact' field has been removed
}

export type SetHeaderData = (field: keyof HeaderData, value: string) => void;
