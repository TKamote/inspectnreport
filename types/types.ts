export interface HeaderData {
  company: string;
  createdBy: string;
  contact: string;
  reportFor: string;
  typeOfReport: string;
  date: string;
}

export type SetHeaderData = (field: keyof HeaderData, value: string) => void;
