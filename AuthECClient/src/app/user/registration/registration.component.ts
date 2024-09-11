import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FirstKeyPipe],
  templateUrl: './registration.component.html',
  styles: ``
})
export class RegistrationComponent {
  constructor(
    public formBuilder: FormBuilder, 
    private service: AuthService,
    private toastr: ToastrService) { }

  isSubmitted:boolean = false;

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password')
    const confirmPassword = control.get('confirmPassword')

    if(password && confirmPassword && password.value != confirmPassword.value)
      confirmPassword?.setErrors({passwordMismath: true})
    else
      confirmPassword?.setErrors(null)

    return null;  
  }

  form = this.formBuilder.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)]],
    confirmPassword: [''],
  }, { validators: this.passwordMatchValidator })



  onSubmit() {
    this.isSubmitted = true;
    if(this.form.valid){
      this.service.createUser(this.form.value)
      .subscribe(
        {
          next:(res:any)=>{
            if(res.succeeded)
            {
              this.form.reset();
              this.isSubmitted = false;
              this.toastr.success('New user created!', 'Registration Successful')
            }
          },
          error:err=>{
            if(err.error.errors)
            err.error.errors.forEach((x:any) => {
              switch(x.code){
                case "DuplicateUserName":
                  break;

                case "DuplicateEmail":
                  this.toastr.error('Email is alredy taken.','Registration Failed')
                  break;

                  default:
                    this.toastr.error('Try in another time','Registration Failed')
                    console.log(x);
                    break;
              }
            })
            else
            console.log('error',err)
          }
        });
    }
  }

  hasDisplaybleError(controlName: string):Boolean{
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) &&
    (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
  }

}
