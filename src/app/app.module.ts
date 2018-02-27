import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, BaseRequestOptions, Http } from '@angular/http';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountListComponent } from './account-list/account-list.component';
import { NewAccountComponent } from './new-account/new-account.component';
import { EditAccountComponent } from './edit-account/edit-account.component';
import { PassManService } from './passman.service';
import { NewUserComponent } from './new-user/new-user.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountListComponent,
    NewAccountComponent,
    EditAccountComponent,
    NewUserComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [PassManService],
  bootstrap: [AppComponent]
})
export class AppModule { }
