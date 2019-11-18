import { FormControl } from '@angular/forms';


export class unionValidator {
  static validNumeroUnion(){
    return (fc: FormControl) => {
      if(fc.value == '000'){
        return ({validNumeroUnion: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroUnion(unionsData, action){
    return (fc: FormControl) => {
      if(unionsData && action === 'ajouter'){
        //console.log(codeCommune);
        for(let v of unionsData){
          if(fc.value && fc.value === v.numero){
            return ({uniqueNumeroUnion: true});
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

  static autreTypeUnion(typeVilage){
    return (fc: FormControl) => {
      if(typeVilage && typeVilage == 'Autre' && (!fc.value  || fc.value == '')){
        return ({autreTypeUnion: true});
      } 
    return (null);
    }
  }

  static requireFederation(indepentdant){
    return (fc: FormControl) => {
      if(indepentdant && indepentdant === 'Non'){
          if(!fc.value || fc.value == ''){
            return ({required: true});
          }
        }else
          return (null);
    }
  }

}
