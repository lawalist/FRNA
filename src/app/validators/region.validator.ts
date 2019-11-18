import { FormControl } from '@angular/forms';
import { isNumber } from 'util';


export class NumeroRegionValidator {
  static validNumeroRegion(){
    return (fc: FormControl) => {
      if(fc.value == '00'){
        return ({validNumeroRegion: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroRegion(regionsData, codePays, action){
    return (fc: FormControl) => {
      if(regionsData && action === 'ajouter'){
        //console.log(codePays);
        for(let r of regionsData){
          if(codePays && fc.value && codePays === r.codePays && fc.value === r.numeroRegion){
            return ({uniqueNumeroRegion: true});
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
