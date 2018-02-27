import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { PassManService } from '../passman.service';
import 'rxjs/add/operator/map';

@Component({
	selector: 'app-new-account',
	templateUrl: './new-account.component.html',
	styleUrls: ['./new-account.component.css']
})
export class NewAccountComponent implements OnInit {

	username: string;
	accountName: string;
	accountPassword: string;
	warningMessage: string = '';
	localServerUrl: string = '';
	verifyAccountPassword: string;

	constructor(private _http: Http,
		private _passManSvc: PassManService) { }

	ngOnInit() {
		this.username = this._passManSvc.getUsername();
		this.localServerUrl = this._passManSvc.getLocalServerUrl();
		this._passManSvc.subscribeToWarningMessages().subscribe(res => {
			this.warningMessage = res;
		});
	}
	submitNewAccount() {
		try {
			if (this._passManSvc.verifyPassword(this.accountPassword, this.verifyAccountPassword)) {
				this._http.post(`${this.localServerUrl}/addAccount`, {
					'username': this.username,
					'password': this.accountPassword,
					'account': this.accountName
				}).map(res => res.json()).subscribe(res => {
					this._passManSvc.getAccountsList();
					this._passManSvc.setWarningMessage('');
					this._passManSvc.doneAddingAccount();
				});
			} else {
				this._passManSvc.setWarningMessage('Passwords don\'t match.');
			}
		} catch (e) {
			console.log(e);
		}
	}
	cancel() {
		this.accountName = '';
		this.accountPassword = '';
		this.verifyAccountPassword = '';
		this._passManSvc.setWarningMessage('');
		this._passManSvc.doneAddingAccount();
	}

}
