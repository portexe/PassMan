import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { PassManService } from '../passman.service';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

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
	editAccountForm: FormGroup;

	constructor(private _http: Http,
		private _passManSvc: PassManService,
		private _fb: FormBuilder) {
		this.editAccountForm = this._fb.group({
			password: ['', Validators.required],
			accountUsername: ['', Validators.required],
			verifyPassword: ['', Validators.required]
		});
	}

	ngOnInit() {
		this.localServerUrl = this._passManSvc.getLocalServerUrl();
		this.username = this._passManSvc.getUsername();
		this._passManSvc.subscribeToWarningMessages().subscribe(res => {
			this.warningMessage = res;
		});
		this.editAccountForm.controls['accountUsername'].setValue(this.accountName[1]);
	}
	submitNewPassword() {
		var formValid: boolean = true;
		if (!this.editAccountForm.controls['verifyPassword'].value ||
			this.editAccountForm.controls['verifyPassword'].value === undefined ||
			this.editAccountForm.controls['verifyPassword'].value === '') {
			this._passManSvc.setWarningMessage('Verify Password field is empty.');
			formValid = false;
		}
		if (!this.editAccountForm.controls['password'].value ||
			this.editAccountForm.controls['password'].value === undefined ||
			this.editAccountForm.controls['password'].value === '') {
			this._passManSvc.setWarningMessage('Password field is empty.');
			formValid = false;
		}
		if (!this.editAccountForm.controls['accountUsername'].value ||
			this.editAccountForm.controls['accountUsername'].value === undefined ||
			this.editAccountForm.controls['accountUsername'].value === '') {
			this.editAccountForm.controls['accountUsername'].setValue('N/A');
		}
		var passwordsMatch: boolean = this.editAccountForm.controls['password'].value === this.editAccountForm.controls['verifyPassword'].value;
		var editAccountObject = {
			'username': this.username,
			'account': this.accountName[0],
			'accountUsername': this.editAccountForm.controls['accountUsername'].value,
			'password': this.editAccountForm.controls['password'].value
		};
		var deleteAccountObject = {
			'username': this.username,
			'account': this.accountName,
		}
		if (formValid) {
			try {
				if (passwordsMatch) {
					this._http.post(`${this.localServerUrl}/deleteAccount`, deleteAccountObject).map(res => res.json()).subscribe(res => {
						try {
							this._http.post(`${this.localServerUrl}/addAccount`, editAccountObject).map(res => res.json()).subscribe(res => {
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
			} catch (e) {

			}
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
