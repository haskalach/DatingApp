import { AlertifyService } from './../../_services/alertify.service';
import { AuthService } from './../../_services/auth.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  regitrationForm: FormGroup;
  user: User;
  @Output() cancelRegister = new EventEmitter();
  constructor(
    private auth: AuthService,
    private alertify: AlertifyService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.createRegisterForm();
    // this.regitrationForm = new FormGroup(
    //   {
    //     userName: new FormControl(null, Validators.required),
    //     password: new FormControl('', [
    //       Validators.required,
    //       Validators.minLength(4),
    //       Validators.maxLength(8)
    //     ]),
    //     confirmPassword: new FormControl('', Validators.required)
    //   },
    //   this.passwordMatchValidators
    // );
  }

  createRegisterForm() {
    this.regitrationForm = this.fb.group(
      {
        gender: ['male'],
        userName: ['', Validators.required],
        knownAs: ['', Validators.required],
        dateOfBirth: [null, Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(8)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validator: this.passwordMatchValidators }
    );
  }

  passwordMatchValidators(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null
      : { missmatch: true };
  }

  register() {
    if (this.regitrationForm.valid) {
      this.user = Object.assign({}, this.regitrationForm.value);
      this.auth.resgiter(this.user).subscribe(
        next => {
          // console.log('resgitration success');
          this.alertify.success('resgitration success');
        },
        error => {
          console.log(error);
          this.alertify.error(error);
        },
        () => {
          this.auth.login(this.user).subscribe(() => {
            this.router.navigate(['/members']);
          });
        }
      );
    }
  }
  cancel() {
    this.cancelRegister.emit(false);
  }
}
