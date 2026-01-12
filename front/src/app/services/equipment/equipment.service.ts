import { Injectable } from '@angular/core';
import { EquipmentType } from '../../models/equipment-type';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment, EquipmentFormData, StockEquipment } from '../../models/models';


@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private readonly baseUrl = `/api/equipment-types`;

  constructor(private readonly http: HttpClient) { }

  getEquipmentType(): Observable<EquipmentType[]> {
    return this.http.get<EquipmentType[]>(this.baseUrl);
  }

  addEquipmentType(name: string): Observable<EquipmentType> {
    return this.http.post<EquipmentType>(this.baseUrl, { name });
  }

  createEquipment(data: EquipmentFormData) {
    return this.http.post<EquipmentFormData>(`/api/equipment`, data);
  }

  updateEquipment(data: EquipmentFormData, id: number) {
    return this.http.patch<EquipmentFormData>(`/api/equipment/${id}`, data);
  }

  getAllEquipment() {
    return this.http.get<Equipment[]>(`/api/equipment`);
  }

  getEquipmentById(equipmentId: number) {
    return this.http.get<EquipmentFormData>(`/api/equipment/${equipmentId}`);
  }

  getStockEquipments() {
    return this.http.get<StockEquipment[]>(`/api/equipment-stocks`);
  }

  createEquipmentStock(equipmentId: number, quantity: number) {
    return this.http.post(`/api/equipment-stocks`, {
      equipmentId: equipmentId,
      durability: quantity,
    });
  }

  assignEquipment(questId: number, equipmentId: number): Observable<void> {
    return this.http.patch<void>(`/api/quests/${questId}/equipment-stocks/attach`, { "ids": [equipmentId] });
  }

  unassignEquipment(questId: number, equipmentId: number): Observable<void> {
    return this.http.patch<void>(`/api/quests/${questId}/equipment-stocks/detach`, { "ids": [equipmentId] });
  }
}
