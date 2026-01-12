import { EquipmentType } from "./equipment-type";

export interface Equipment {
    id: number;
    name: string;
    equipmentTypeId: number;
    equipmentType: EquipmentType;
    cost: number; // in copper pieces
    maxDurability: number;
}

export interface EquipmentFormData {
    name: string;
    equipmentTypeId: number;
    cost: number; // in copper pieces
    maxDurability: number;
}