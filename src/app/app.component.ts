import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable'
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { PassManService } from './passman.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	title = 'PassMan';
	username: string;
	password: string;
	localServerUrl: string;
	lastLoggedInUser: string;
	warningMessage: string = '';
	creatingUser: boolean = false;
	usernameConfirmed: boolean = false;
	passwordConfirmed: boolean = false;

	constructor(private _http: Http,
		private _passManSvc: PassManService) { }

	ngOnInit() {
		this.localServerUrl = this._passManSvc.getLocalServerUrl();
		this._passManSvc.subscribeToWarningMessages().subscribe(res => {
			this.warningMessage = res;
		});
		this._passManSvc.subscribeToSignoutObservable().subscribe(res => {
			this.password = '';
			this.usernameConfirmed = false;
			this.passwordConfirmed = false;
			this.username = '';
			this.getLastLoggedInUser();
		});
		this._passManSvc.subscribeToDoneCreatingNewUserObservable().subscribe(res => {
			this.password = '';
			this.usernameConfirmed = false;
			this.passwordConfirmed = false;
			this.username = '';
			this.creatingUser = false;
		});
		this.getLastLoggedInUser();
	}
	getLastLoggedInUser() {
		this._http.get(`${this.localServerUrl}/init`).map(res => res.json()).subscribe(res => {
			if (res.username === 'none') {
				this.lastLoggedInUser = 'none';
			} else {
				this.lastLoggedInUser = res.username;
			}
		});
	}
	checkUsername() {
		this._http.put(`${this.localServerUrl}/login`, { 'username': this.username })
			.map(res => res.json()).subscribe(res => {
				try {
					if (res.result === true) {
						this.usernameConfirmed = true;
						this._passManSvc.setWarningMessage('');
						this._passManSvc.setUsername(this.username);
					} else if (res.result === false) {
						this._passManSvc.setWarningMessage(`Username: "${this.username}" does not exist.`);
					}
				} catch (e) {
					console.log(e);
				}
			});
	}
	checkMasterPassword() {
		this._http.post(`${this.localServerUrl}/login`, { 'username': this.username, 'password': this.password })
			.map(res => res.json()).subscribe(res => {
				try {
					if (res.result === true) {
						this.password = '';
						this._passManSvc.setWarningMessage('');
						this.passwordConfirmed = true;
					} else if (res.result === false) {
						this.password = '';
						this._passManSvc.setWarningMessage('Incorrect Password. Please try again.');
					}
				} catch (e) {
					console.log(e);
				}
			});
	}
	quickLogin() {
		this.username = this.lastLoggedInUser;
		this.checkUsername();
	}
	logInAsDifferentUserClick() {
		console.log('uhhhhhhhhh');
		this.lastLoggedInUser = 'none';
		// this._passManSvc.signOut();
		this._passManSvc.resetLastUser();
		this.usernameConfirmed = false;
		this.passwordConfirmed = false;
		this.username = '';
	}
	createNewUser() {
		this.creatingUser = true;
	}
	signOut () {
		this._passManSvc.signOut();
	}
}
