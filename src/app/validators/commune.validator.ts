import { FormControl } from '@angular/forms';


export class NumeroCommuneValidator {
  static validNumeroCommune(){
    return (fc: FormControl) => {
      if(fc.value == '00'){
        return ({validNumeroCommune: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroCommune(communesData, codeDepartement, action){
    return (fc: FormControl) => {
      if(communesData && action === 'ajouter'){
        //console.log(codeDepartement);
        for(let d of communesData){
          if(codeDepartement && fc.value && codeDepartement === d.codeDepartement && fc.value === d.numeroCommune){
            return ({uniqueNumeroCommune: true});
          } /*else {
            return (null);
          }*/
        }
        return (null);
      }else{
        return (null);
      }
    }
  }
}
