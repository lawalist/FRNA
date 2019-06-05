//prend en parametre un tableau d'bojet JSON et renvoi un tableau HTML
function JSONToTHMLTable(data, id, langue, mobile) {
       var s = JSON.stringify(data);
       var delimiter = ",";
       var nobreaks  = false;
       //var broke     = false;
       //var brokeArray= "A";
       //var A=null;
       if(s.trim()!="") {
         try {
          var inArray = [];
		      var a;
          inArray=arrayFrom(JSON.parse(s));
          var outArray = [];
          for (var row in inArray) {
           outArray[outArray.length] = parse_object(inArray[row]);
          }
          var options = {};
          options.separator = delimiter;
          options.headers = true;
          options.noBreaks = nobreaks;
          
          var csv = $.csv.fromObjects(outArray,options);
          if(options.headers && (csv.charAt(0)==='\n'||csv.charAt(0)==='\r'))csv="Field1"+csv;
          var csvJson = csv;
          CSV.isFirstRowHeader = true;
          CSV.delimiter=delimiter;
          CSV.autodetect = false;
          CSV.parse(csvJson);
          var result = {};
          result.table = csvToTable(CSV, true, false,false,a,id+"-datatable");
          document.getElementById(id).innerHTML = result.table;
		      var resizefunc = [];
          result.datatable = TableManageButtons.init(id+"-datatable", langue, mobile);
          return result;
         }
         catch (e) {
           ; 
         }
       }
       
    }

    
    function reCreateTHMLTable(table, id, langue, mobile) {
      try {
        var result = {};
        result.table = table;
        document.getElementById(id).innerHTML = table;
        var resizefunc = [];
        result.datatable = TableManageButtons.init(id+"-datatable", langue, mobile);
        return result;
      }
      catch (e) {
        ; 
      }
   }

	