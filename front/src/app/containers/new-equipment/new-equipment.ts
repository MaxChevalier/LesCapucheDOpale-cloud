import { Component } from '@angular/core';
import { FormEquipment } from '../../components/form-equipment/form-equipment';
import { Router } from '@angular/router';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { Equipment, EquipmentFormData } from '../../models/equipment';

@Component({
  selector: 'app-new-equipment',
  imports: [
    FormEquipment
  ],
  templateUrl: './new-equipment.html',
  styleUrl: './new-equipment.scss',
})
export class NewEquipment {
  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly router: Router
  ) {}

  protected onSubmit(data: EquipmentFormData): void {
      this.equipmentService.createEquipment(data).subscribe({
        next: () => {
          this.router.navigate(['/equipments']);
        },
        error: (error) => {
          console.error('Error creating equipment:', error);
        }
      });
    }
}
