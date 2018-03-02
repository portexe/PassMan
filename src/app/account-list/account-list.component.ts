import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { PassManService } from '../passman.service';
import 'rxjs/add/operator/map';

@Component({
	selector: 'app-account-list',
	templateUrl: './account-list.component.html',
	styleUrls: ['./account-list.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class AccountListComponent implements OnInit, OnDestroy {

	username: string;
	viewPW: string = '';
	chosenAccount: string;
	localServerUrl: string;
	accounts: any;
	editingWhichAccount: string = '';
	addingNewAccount: boolean = false;

	constructor(private _http: Http,
		private _passManSvc: PassManService) { }

	ngOnInit() {
		this.username = this._passManSvc.getUsername();
		this.localServerUrl = this._passManSvc.getLocalServerUrl();
		this._passManSvc.subscribeToAccountsList().subscribe(res => {
			this.accounts = res;
		});
		this._passManSvc.subscribeToDoneAddingAccountObservable().subscribe(res => {
			if (res === true) {
				this.addingNewAccount = false;
			}
		});
		this._passManSvc.subscribeToDoneEditingAccountObservable().subscribe(res => {
			if (res === true) {
				this.editingWhichAccount = '';
			}
		});
		this._passManSvc.subscribeToSignoutObservable().subscribe(res => {
			this.stopViewingPassword();
			this.accounts = [];
			this.editingWhichAccount = '';
			this.addingNewAccount = false;
		});
		this._passManSvc.getAccountsList();
	}
	ngOnDestroy() {
		this.stopViewingPassword();
		this.accounts = [];
		this.editingWhichAccount = '';
		this.addingNewAccount = false;
	}
	accountUsernameExists(username) {
		if(!username || username === '' || username === undefined)
			return false;
		return true;
	}
	viewPasswordForAccount(account: string) {
		this._http.post(`${this.localServerUrl}/menu`, { 'username': this.username, 'account': account }).map(res => res.json()).subscribe(res => {
			try {
				this.chosenAccount = account;
				this.viewPW = res;
			} catch (e) {
				console.log(e);
			}
		});
	}
	addAccountClick() {
		this.stopViewingPassword();
		this.addingNewAccount = true;
	}
	isChosenAccount(account: string) {
		if (this.chosenAccount === account)
			return true;
		else
			return false;
	}
	stopViewingPassword() {
		this.chosenAccount = '';
		this.viewPW = '';
	}
	editAccount(acct: string) {
		this.stopViewingPassword();
		this.editingWhichAccount = acct;
	}
	isEditingAccount() {
		if (this.editingWhichAccount === '')
			return false;
		else
			return true;
	}
	deleteAccount(account: string) {
		var confirmation = confirm(`Are you sure you want to delete ${account}?`);
		if (confirmation === true) {
			this._http.post(`${this.localServerUrl}/deleteAccount`, { 'username': this.username, 'account': account }).map(res => res.json()).subscribe(res => {
				try {
					this._passManSvc.getAccountsList();
				} catch (e) {
					console.log(e);
				}
			});
		}
	}
}
