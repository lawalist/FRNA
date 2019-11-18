import { FormControl } from '@angular/forms';


export class NumeroVillageValidator {
  static validNumeroVillage(){
    return (fc: FormControl) => {
      if(fc.value == '000'){
        return ({validNumeroVillage: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroVillage(villagesData, codeCommune, action){
    return (fc: FormControl) => {
      if(villagesData && action === 'ajouter'){
        //console.log(codeCommune);
        for(let v of villagesData){
          if(codeCommune && fc.value && codeCommune === v.codeCommune && fc.value === v.numeroVillage){
            return ({uniqueNumeroVillage: true});
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

  static autreTypeVillage(typeVilage){
    return (fc: FormControl) => {
      if(typeVilage && typeVilage == 'Autre' && (!fc.value  || fc.value == '')){
        return ({autreTypeVillage: true});
      } 
    return (null);
    }
  }
}
