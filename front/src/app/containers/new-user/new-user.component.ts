import { Component } from '@angular/core';
import {FormNewUserComponent} from "../../components/form-new-user/form-new-user.component";

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [FormNewUserComponent],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.scss'
})
export class NewUserComponent {

}
