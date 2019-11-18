import { FormControl } from '@angular/forms';


export class opValidator {
  static validNumeroOp(){
    return (fc: FormControl) => {
      if(fc.value == '000'){
        return ({validNumeroOp: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroOp(opsData, action){
    return (fc: FormControl) => {
      if(opsData && action === 'ajouter'){
        //console.log(codeCommune);
        for(let v of opsData){
          if(fc.value && fc.value === v.numero){
            return ({uniqueNumeroOp: true});
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

  static autreTypeOp(typeVilage){
    return (fc: FormControl) => {
      if(typeVilage && typeVilage == 'Autre' && (!fc.value  || fc.value == '')){
        return ({autreTypeOp: true});
      } 
    return (null);
    }
  }

  static requireUnion(indepentdant){
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
