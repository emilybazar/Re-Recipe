import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { DiscoverComponent } from './discover/discover.component';
import { CreaterecipeComponent } from './createrecipe/createrecipe.component';
import { CookbookComponent } from './cookbook/cookbook.component';
import { SinglerecipeviewComponent } from './singlerecipeview/singlerecipeview.component';
import { ProfileComponent } from './profile/profile.component';
const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'discover', component:  DiscoverComponent},
  { path: 'createrecipe', component: CreaterecipeComponent},
  { path: 'cookbook',component:CookbookComponent},
  { path: 'discover/:recipeID', component: SinglerecipeviewComponent },
  {path: 'profile', component:ProfileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
