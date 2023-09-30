export interface TableItem {
  pk: string;
  sk: 'details' | 'results';
}

export interface Donation extends TableItem {
  pk: string;
  sk: 'details';
  status: string;
  url: string;
}

export interface DonationResults extends TableItem {
  pk: string;
  sk: 'results';
  url: string;
  // TBD
  [name: string]: any;
}
