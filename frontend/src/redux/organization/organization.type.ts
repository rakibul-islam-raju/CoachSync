export interface IOrgShortStats {
  active_batches: number;
  active_classes: number;
  active_teachers: number;
}

export interface IOrganization {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}
