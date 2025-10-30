import { Routes } from '@angular/router';
import { NewAdventurerComponent } from './containers/new-adventurer/new-adventurer.component';
import { ListAdventurer } from './containers/list-adventurer/list-adventurer';
import { UpdateAdventurer } from './containers/update-adventurer/update-adventurer';
import { NewUserComponent } from '../app/containers/new-user/new-user.component';
import { HomeComponent } from '../app/containers/home/home'
export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'adventurer/new', component: NewAdventurerComponent },
    { path: 'adventurers', component: ListAdventurer},
    { path: 'adventurer/:id', component: UpdateAdventurer},
    { path: 'user/new', component: NewUserComponent }
]