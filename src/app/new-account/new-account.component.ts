import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { PassManService } from '../passman.service';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-new-account',
	templateUrl: './new-account.component.html',
	styleUrls: ['./new-account.component.css']
})
export class NewAccountComponent implements OnInit {

	username: string;
	warningMessage: string = '';
	localServerUrl: string = '';
	newAccountForm: FormGroup;

	constructor(private _http: Http,
		private _passManSvc: PassManService,
		private _fb: FormBuilder) {
		this.newAccountForm = this._fb.group({
			accountName: ['', Validators.required],
			accountUsername: ['', Validators.required],
			password: ['', Validators.required],
			verifyPassword: ['', Validators.required]
		});
	}

	ngOnInit() {
		this.username = this._passManSvc.getUsername();
		this.localServerUrl = this._passManSvc.getLocalServerUrl();
		this._passManSvc.subscribeToWarningMessages().subscribe(res => {
			this.warningMessage = res;
		});
	}
	submitNewAccount() {
		var formValid: boolean = true;
		if (!this.newAccountForm.controls['verifyPassword'].value ||
			this.newAccountForm.controls['verifyPassword'].value === undefined ||
			this.newAccountForm.controls['verifyPassword'].value === '') {
			this._passManSvc.setWarningMessage('Verify Password field is empty.');
			formValid = false;
		}
		if (!this.newAccountForm.controls['password'].value ||
			this.newAccountForm.controls['password'].value === undefined ||
			this.newAccountForm.controls['password'].value === '') {
			this._passManSvc.setWarningMessage('Password field is empty.');
			formValid = false;
		}
		if (!this.newAccountForm.controls['accountUsername'].value ||
			this.newAccountForm.controls['accountUsername'].value === undefined ||
			this.newAccountForm.controls['accountUsername'].value === '') {
			this.newAccountForm.controls['accountUsername'].setValue('N/A');
		}
		if (!this.newAccountForm.controls['accountName'].value ||
			this.newAccountForm.controls['accountName'].value === undefined ||
			this.newAccountForm.controls['accountName'].value === '') {
			this._passManSvc.setWarningMessage('Account Name field is empty.');
			formValid = false;
		}
		var passwordsMatch: boolean = this.newAccountForm.controls['password'].value === this.newAccountForm.controls['verifyPassword'].value;
		var newAccountObject = {
			'username': this.username,
			'account': this.newAccountForm.controls['accountName'].value,
			'password': this.newAccountForm.controls['password'].value,
			'accountUsername': this.newAccountForm.controls['accountUsername'].value
		};
		if (formValid) {
			try {
				if (passwordsMatch) {
					this._http.post(`${this.localServerUrl}/addAccount`, newAccountObject).map(res => res.json()).subscribe(res => {
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
	}
	cancel() {
		this._passManSvc.setWarningMessage('');
		this._passManSvc.doneAddingAccount();
	}
}
