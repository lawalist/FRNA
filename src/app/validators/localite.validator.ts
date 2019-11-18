import { FormControl } from '@angular/forms';


export class NumeroLocaliteValidator {
  static validNumeroLocalite(){
    return (fc: FormControl) => {
      if(fc.value == '000'){
        return ({validNumeroLocalite: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroLocalite(localitesData, codeCommune, action){
    return (fc: FormControl) => {
      if(localitesData && action === 'ajouter'){
        //console.log(codeCommune);
        for(let v of localitesData){
          if(codeCommune && fc.value && codeCommune === v.codeCommune && fc.value === v.numeroLocalite){
            return ({uniqueNumeroLocalite: true});
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

  static autreTypeLocalite(typeVilage){
    return (fc: FormControl) => {
      if(typeVilage && typeVilage == 'Autre' && (!fc.value  || fc.value == '')){
        return ({autreTypeLocalite: true});
      } 
    return (null);
    }
  }
}
