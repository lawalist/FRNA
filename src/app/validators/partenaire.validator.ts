import { FormControl } from '@angular/forms';


export class NumeroPartenaireValidator {
  static validNumeroPartenaire(){
    return (fc: FormControl) => {
      if(fc.value == '000'){
        return ({validNumeroPartenaire: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroPartenaire(partenairesData, action){
    return (fc: FormControl) => {
      if(partenairesData && action === 'ajouter'){
        //console.log(codeCommune);
        for(let v of partenairesData){
          if(fc.value && fc.value === v.numero){
            return ({uniqueNumeroPartenaire: true});
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

  static autreTypePartenaire(typeVilage){
    return (fc: FormControl) => {
      if(typeVilage && typeVilage == 'Autre' && (!fc.value  || fc.value == '')){
        return ({autreTypePartenaire: true});
      } 
    return (null);
    }
  }
}
