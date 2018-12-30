import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { MemberListResolver } from './_resolvers/member-lis.resolver';
import { MemberDetailedComponent } from './pages/member/member-detailed/member-detailed.component';
import { MainLayoutComponent } from './_layout/main-layout/main-layout.component';
import { AuthGuard } from './_guards/auth.guard';
import { MessagesComponent } from './pages/messages/messages.component';
import { HomeComponent } from './pages/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListsComponent } from './pages/lists/lists.component';
import { MemberListComponent } from './pages/member/member-list/member-list.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberEditComponent } from './pages/member/member-edit/member-edit.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      // user area
      {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        children: [
          {
            path: 'members',
            component: MemberListComponent,
            resolve: { users: MemberListResolver }
          },
          {
            path: 'members/:id',
            component: MemberDetailedComponent,
            resolve: { user: MemberDetailResolver }
          },
          {
            path: 'member/edit',
            component: MemberEditComponent,
            resolve: { user: MemberEditResolver },
            canDeactivate: [PreventUnsavedChanges]
          },
          {
            path: 'messages',
            component: MessagesComponent
          },
          { path: 'lists', component: ListsComponent }
        ]
      }
    ]
  },

  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
