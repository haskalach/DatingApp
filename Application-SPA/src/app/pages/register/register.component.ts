import { AlertifyService } from './../../_services/alertify.service';
import { AuthService } from './../../_services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  regitrationForm: FormGroup;
  @Output() cancelRegister = new EventEmitter();
  constructor(private auth: AuthService, private alertify: AlertifyService) {}

  ngOnInit() {
    this.regitrationForm = new FormGroup({
      userName: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
    });
  }

  register() {
    console.log(this.regitrationForm.value);
    this.auth.resgiter(this.regitrationForm.value).subscribe(
      next => {
        // console.log('resgitration success');
        this.alertify.success('resgitration success');
      },
      error => {
        console.log(error);
        this.alertify.error(error);
      }
    );
  }
  cancel() {
    this.cancelRegister.emit(false);
  }
}
