import { FormControl } from '@angular/forms';


export class CodePaysValidator {
  static validCodePays(pays, action){
    return (fc: FormControl) => {
      //var codesPays: any = ['NE'];
      if(pays && pays.data && action === 'ajouter'){
        for(let i = 0; i < pays.data.length; i++){
          if(fc.value === pays.data[i].codePays){
            return ({validCodePays: true});
          } else {
            return (null);
          }
        }
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
