import { ConsumableType, EquipmentType, Speciality } from "./models";

export interface Adventurer {
  id: number;
  name: string;
  speciality: Speciality;
  specialityId: number;
  equipmentType: EquipmentType[];
  equipmentTypeIds: number[];
  consumableType: ConsumableType[];
  consumableTypeIds: number[];
  dailyRate: number; // in copper pieces
  experience: number;
}

export interface AdventurerFormData {
  name: string;
  specialityId: number;
  equipmentTypeIds: number[];
  consumableTypeIds: number[];
  dailyRate: number; // in copper pieces
}