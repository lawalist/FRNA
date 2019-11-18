import { FormControl } from '@angular/forms';


export class NumeroDepartementValidator {
  static validNumeroDepartement(){
    return (fc: FormControl) => {
      if(fc.value == '00'){
        return ({validNumeroDepartement: true});
      } else {
        return (null);
      }
    }
  }

  
  static uniqueNumeroDepartement(departementsData, codeRegion, action){
    return (fc: FormControl) => {
      if(departementsData && action === 'ajouter'){
        //console.log(codeRegion);
        for(let d of departementsData){
          if(codeRegion && fc.value && codeRegion === d.codeRegion && fc.value === d.numeroDepartement){
            return ({uniqueNumeroDepartement: true});
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
