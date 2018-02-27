import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

const localServerUrl: string = 'http://127.0.0.1:5000';

@Injectable()
export class PassManService {

	private username: string;
	private accounts: string[] = [];
	private warningMessage: string;

	accountsListSubject: ReplaySubject<any>;
	accountsListObservable: Observable<any>;
	warningMessageSubject: ReplaySubject<any>;
	warningMessageObservable: Observable<any>;
	doneAddingAccountSubject: ReplaySubject<any>;
	doneAddingAccountObservable: Observable<any>;
	doneEditingAccountSubject: ReplaySubject<any>;
	doneEditingAccountObservable: Observable<any>;
	signOutSubject: ReplaySubject<any>;
	signOutObservable: Observable<any>;
	doneCreatingNewUserSubject: ReplaySubject<any>;
	doneCreatingNewUserObservable: Observable<any>;

	constructor(private _http: Http) {
		this.accountsListSubject = <ReplaySubject<any>>new ReplaySubject();
		this.accountsListObservable = this.accountsListSubject.asObservable();
		this.warningMessageSubject = <ReplaySubject<any>>new ReplaySubject();
		this.warningMessageObservable = this.warningMessageSubject.asObservable();
		this.doneAddingAccountSubject = <ReplaySubject<any>>new ReplaySubject();
		this.doneAddingAccountObservable = this.doneAddingAccountSubject.asObservable();
		this.doneEditingAccountSubject = <ReplaySubject<any>>new ReplaySubject();
		this.doneEditingAccountObservable = this.doneEditingAccountSubject.asObservable();
		this.signOutSubject = <ReplaySubject<any>>new ReplaySubject();
		this.signOutObservable = this.signOutSubject.asObservable();
		this.doneCreatingNewUserSubject = <ReplaySubject<any>>new ReplaySubject();
		this.doneCreatingNewUserObservable = this.doneCreatingNewUserSubject.asObservable();

	}

	setUsername(un: string) {
		this.username = un;
	}
	getUsername() {
		return this.username;
	}
	getLocalServerUrl() {
		return localServerUrl;
	}
	verifyPassword(pw1, pw2) {
		if (pw1 === pw2)
			return true;
		else
			return false;
	}
	subscribeToWarningMessages() {
		return this.warningMessageObservable;
	}
	setWarningMessage(msg: string) {
		this.warningMessage = msg;
		this.warningMessageSubject.next(this.warningMessage);
	}
	subscribeToAccountsList() {
		return this.accountsListObservable;
	}
	getAccountsList() {
		if (this.username === '') return;
		this._http.put(`${localServerUrl}/menu`, { 'username': this.username }).map(res => res.json()).subscribe(res => {
			try {
				this.accounts = res;
				this.accountsListSubject.next(this.accounts);
			} catch (e) {
				console.log(e);
			}
		});
	}
	subscribeToDoneAddingAccountObservable() {
		return this.doneAddingAccountObservable;
	}
	doneAddingAccount() {
		this.doneAddingAccountSubject.next(true);
	}
	subscribeToDoneEditingAccountObservable() {
		return this.doneEditingAccountObservable;
	}
	doneEditingAccount() {
		this.doneEditingAccountSubject.next(true);
	}
	subscribeToSignoutObservable() {
		return this.signOutObservable;
	}
	subscribeToDoneCreatingNewUserObservable() {
		return this.doneCreatingNewUserObservable;
	}
	doneCreatingNewUser() {
		this.doneCreatingNewUserSubject.next(true);
	}
	signOut() {
		this._http.post(`${localServerUrl}/logout`, { 'username': this.username });
		this.accounts = [];
		this.setUsername('');
		this.setWarningMessage('');
		this.signOutSubject.next(true);
	}
	resetLastUser() {
		this._http.put(`${localServerUrl}/resetLastUser`, {'username': 'none'}).map(res => res.json()).subscribe( res => {
			this.signOut();
		});
	}
}
