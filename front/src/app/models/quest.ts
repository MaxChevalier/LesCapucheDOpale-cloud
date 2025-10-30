export interface Quest {
    id: number;
    name: string;
    description: string;
}

export interface QuestForm {
    name: string;
    description: string;
    finalDate: string;
    estimatedDuration: number;
    reward: number;
}