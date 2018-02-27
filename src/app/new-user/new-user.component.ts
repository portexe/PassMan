import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { PassManService } from '../passman.service';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-new-user',
	templateUrl: './new-user.component.html',
	styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {

	password: string;
	username: string;
	passwordVerify: string;
	warningMessage: string;
	localServerUrl: string;
	newUserForm: FormGroup;

	constructor(private _http: Http,
		private _passManSvc: PassManService,
		private _fb: FormBuilder) {
		this.newUserForm = this._fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
			verifyPassword: ['', Validators.required]
		});
	}

	ngOnInit() {
		this.localServerUrl = this._passManSvc.getLocalServerUrl();
		this._passManSvc.subscribeToWarningMessages().subscribe(res => {
			this.warningMessage = res;
		});
	}

	cancelNewUser() {
		this._passManSvc.doneCreatingNewUser();
		this._passManSvc.setWarningMessage('');
	}

	submitNewUser() {
		var passwordsMatch: boolean = this.newUserForm.controls['password'].value === this.newUserForm.controls['verifyPassword'].value;
		var newUserObject = {
			'username': this.newUserForm.controls['username'].value,
			'password': this.newUserForm.controls['password'].value
		};
		console.log(newUserObject);
		if (passwordsMatch) {
			this._http.post(`${this.localServerUrl}/newUser`, newUserObject).map(res => res.json()).subscribe(res => {
				if (res.response === true) {
					this._passManSvc.doneCreatingNewUser();
					this._passManSvc.setWarningMessage('');
				} else {
					this._passManSvc.setWarningMessage(res.msg);
				}
			});
		} else {
			this._passManSvc.setWarningMessage('Passwords do not match.');
		}
	}
}
