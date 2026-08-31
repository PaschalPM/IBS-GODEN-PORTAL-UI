export interface Bank {
  id: number;
  name: string;
  code: string | null;
}

export interface BanksResponse {
  status: string;
  message: string;
  data: Bank[];
}

