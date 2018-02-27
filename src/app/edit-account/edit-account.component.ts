import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { PassManService } from '../passman.service';
import 'rxjs/add/operator/map';

@Component({
	selector: 'app-edit-account',
	templateUrl: './edit-account.component.html',
	styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit {

	newAccountPassword: string;
	username: string;
	verifyNewAccountPassword: string;
	localServerUrl: string;
	warningMessage: string;
	@Input() accountName: string;

	constructor(private _http: Http,
		private _passManSvc: PassManService) { }

	ngOnInit() {
		this.localServerUrl = this._passManSvc.getLocalServerUrl();
		this.username = this._passManSvc.getUsername();
		this._passManSvc.subscribeToWarningMessages().subscribe(res => {
			this.warningMessage = res;
		});
	}
	submitNewPassword() {
		// An edit will be deleting the old row and replacing it with a new one.
		if (this._passManSvc.verifyPassword(this.newAccountPassword, this.verifyNewAccountPassword)) {
			this._http.post(`${this.localServerUrl}/deleteAccount`, {
				'username': this.username,
				'account': this.accountName
			}).map(res => res.json()).subscribe(res => {
				try {
					this._http.post(`${this.localServerUrl}/addAccount`, {
						'username': this.username,
						'password': this.newAccountPassword,
						'account': this.accountName
					}).map(res => res.json()).subscribe(res => {
						this._passManSvc.getAccountsList();
						this._passManSvc.setWarningMessage('');
						this._passManSvc.doneEditingAccount();
					});
				} catch (e) {
					console.log(e);
				}
			});
		} else {
			this._passManSvc.setWarningMessage('Passwords don\'t match.');
		}
	}
	cancel() {
		this.newAccountPassword = '';
		this.verifyNewAccountPassword = '';
		this._passManSvc.setWarningMessage('');
		this.accountName = '';
		this._passManSvc.doneEditingAccount();
	}
}
