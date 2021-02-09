import { Directive, ElementRef, HostListener,Input } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]'
})
export class OnlyNumbersDirective {
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d*$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  @Input() blnMaxValue:boolean = false;
  @Input() maxValue:number = 0;

  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event) {
    //event.target.placeholder = "UNDEFINED";

    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
    this.validarMaximo(event,next);
  }

  @HostListener('paste', ['$event'])
  onPaste(event){
    let pastedText = event.clipboardData.getData('text');
    if (!String(pastedText).match(this.regex)) {
      //event.target.placeholder = "ERROR AL COPIAR";
      event.preventDefault();
    }
    this.validarMaximo(event,pastedText);
  }

  @HostListener('blur', ['$event'])
  blur(event){
    //event.target.placeholder = "UNDEFINED";
    if (event.target.value === "" || !String(event.target.value).match(this.regex)) {
      event.target.value ="";
    }
  }

  validarMaximo(event:any,valor:string):void{
    if(this.blnMaxValue && Number(valor)>this.maxValue){
      //event.target.placeholder = `MAX:${valor}`;
      event.preventDefault();
    }
  }
}
