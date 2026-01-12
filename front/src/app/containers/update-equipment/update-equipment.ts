import { Component, OnInit } from '@angular/core';
import { FormEquipment } from '../../components/form-equipment/form-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipmentFormData } from '../../models/models';

@Component({
  selector: 'app-update-equipment',
  imports: [
    FormEquipment,
  ],
  templateUrl: './update-equipment.html',
  styleUrl: './update-equipment.scss',
})
export class UpdateEquipment implements OnInit {
  protected equipment!: EquipmentFormData;
  id: number = 0;

  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const idStr = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : -1;

    if (!idStr || !/^\d+$/.test(idStr) || this.id < 0 || isNaN(this.id)) {
      console.error('Invalid adventurer ID');
    }
    else {
      this.equipmentService.getEquipmentById(this.id).subscribe(equipment => {
        this.equipment = equipment;
      });
    }
  }

  protected onFormSubmitted(data: EquipmentFormData): void {
    this.equipmentService.createEquipment(data).subscribe({
      next: (equipment) => {
        this.router.navigate(['/equipments']);
      },
      error: (error) => {
        console.error('Error updating equipment:', error);
      }
    });
  }
}
