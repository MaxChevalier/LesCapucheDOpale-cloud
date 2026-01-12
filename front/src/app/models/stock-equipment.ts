import { Equipment } from "./equipment";

export interface StockEquipment {
    id: number;
    durability: number;
    equipmentId: number;
    equipment: Equipment;
}