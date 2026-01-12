import { ConsumableType } from "./consumable-type";

export interface Consumable {
    id: number;
    name: string;
    consumableTypeId: number;
    consumableType: ConsumableType;
    cost: number; // in copper pieces
    quantity: number;
}

export interface ConsumableFormData {
    name: string;
    consumableTypeId: number;
    cost: number; // in copper pieces
    quantity: number;
}