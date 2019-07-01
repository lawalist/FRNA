import { FormControl } from '@angular/forms';


export class CodePaysValidator {
  static validCodePays(pays, action){
    return (fc: FormControl) => {
      //var codesPays: any = ['NE'];
      if(pays && pays.data && action == 'ajouter'){
        for(let p of pays.data){
          if(fc.value == p.codePays){
            return ({validCodePays: true});
          } 
        }
        return (null);
      }else{
        return (null);
      }
    } 
  }


  /*static validCodePays(fc: FormControl){
    var codesPays: any = ['NE'];
    for(let i = 0; i < codesPays.length; i++){
      if(fc.value === codesPays[i]){
        return ({validCodePays: true});
      } else {
        return (null);
      }
    }
    
  }*/
}
