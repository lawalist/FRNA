//prend en parametre un tableau d'bojet JSON et renvoi un tableau HTML
function createDataTable(id, columns, data, langue, tanslate, peutExporterDonnees) {
       var result = {};
       result.table =  createEmptyHtmlTableWithColumns(id, columns);
       document.getElementById(id).innerHTML = result.table;
       var resizefunc = [];
       result.datatable = TableManageButtons.init(id+"-datatable", columns, data, langue, tanslate, peutExporterDonnees);
       return result;   
 }

 
function JSONToCSVAndTHMLTable(data, id, tanslate, format) {
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
       if(format == 'csv'){
           return csv
       }else {
        var csvJson = csv;
        CSV.isFirstRowHeader = true;
        CSV.delimiter=delimiter;
        CSV.autodetect = false;
        CSV.parse(csvJson);
        
        return csvToTable(CSV, true, false,false,a,id+"-datatable", tanslate.instant('GENERAL.FIELD'));
       }
       
      }
      catch (e) {
        ; 
      }
    }
    
 }


function JSONToTHMLTable(data, id, langue, tanslate, peutExporterDonnees) {
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
          result.table = csvToTable(CSV, true, false,false,a,id+"-datatable", tanslate.instant('GENERAL.FIELD'));
          document.getElementById(id).innerHTML = result.table;
          var resizefunc = [];
          result.datatable = TableManageButtons.init(id+"-datatable", langue, tanslate, peutExporterDonnees);
          return result;
         }
         catch (e) {
           ; 
         }
       }
       
    }

    
    function reCreateTHMLTable(table, id, langue, tanslate, peutExporterDonnees) {
      try {
        var result = {};
        result.table = table;
        document.getElementById(id).innerHTML = table;
        var resizefunc = [];
        result.datatable = TableManageButtons.init(id+"-datatable", langue, tanslate, peutExporterDonnees);
        return result;
      }
      catch (e) {
        ; 
      }
   }

   function HTMLTableToJSON(table, what){
    var delimiter = ",";
    var noMultiLines = true;
    var whichTable = 0;
    var forceHeader = false;
    whichTable = whichTable || "0";
    var bQuotes = false;
    var removeTags = true;
    //var html = document.createRange().createContextualFragment(table);
    //var tbl = html.firstChild;
    var tbl = $.parseHTML(table);
    var s = "";
    var cells;
    var value;
    var cnt = tbl.length;
    var re = new RegExp("<\/?\\w+((\\s+\\w+(\\s*=\\s*(?:\".*?\"|'.*?'|[^'\">\\s]+))?)+\\s*|\\s*)\/?>", 'igm');
    var headerFound = false;
    for (var j = 0; j < tbl.length; j++) {
        if (("" + (j + 1)) != whichTable && whichTable != "0") continue;
        rows = tbl[j].getElementsByTagName('tr');
        for (var k = 0; k < rows.length; k++) {
            if (k == 0) {
                cells = rows[k].getElementsByTagName('th');
                if (cells && cells.length > 0) headerFound = true;
            }
            if ('querySelectorAll' in document) {
                cells = rows[k].querySelectorAll('td,th');
            } else {
                cells = rows[k].getElementsByTagName('td');
                if (!cells || cells.length == 0) {
                    cells = rows[k].getElementsByTagName('th');
                }
            }

            for (var n = 0; n < cells.length; n++) {
                value = cells[n].innerHTML;
                if (value == null) value = ""; else value += "";
                value = value.replace(/\r\n|\r|\n/gmi, ' ');
                if (noMultiLines) value = value.replace(/\n|<br>|<br\/>|<br \/>/gmi, '\n');
                //else value = value.replace(/\r\n|\r|\n|<br>|<br\/>|<br \/>/gmi,'\n');
                if (removeTags) value = value.replace(re, '');
                value = _.unescape(value);
                value = value.replace(/&nbsp;/gmi, " ");
                value = value.trim();
                if (bQuotes) {
                    s += '"' + value.replace(/"/gmi, '""') + '"' + delimiter;
                }
                else {
                    s += value.toCsv(delimiter, '"') + delimiter;
                }
            }
            s = s.slice(0, delimiter.length * -1); // remove last delimiter
            s += "\n";
        }
    }

    var options = { "global": [] };
    options.forceWrap = false;
    options.nullIsNull = true;
    options.useFieldsData = false;
    options.fldPropName = "fields";
    options.dataPropName = "data";

    CSV.isFirstRowHeader = headerFound || forceHeader;
    CSV.parse(s);
    what = what;
    switch (what) {
        //HTML To JSON: Convert HTML Table To JSON
        case 1: options.isKeyed = false;
            console.log(csvToJSON(CSV, options));
            break;
        //HTML To Keyed JSON: Convert HTML Table To JSON indexed by field value
        case 2: options.isKeyed = true;
            console.log(csvToJSON(CSV, options));
            break;
        //HTML To JSON Array: Convert HTML Table To JSON Array
        case 3: console.log(csvToJSONArray(CSV, options));
            break;
        //HTML To JSON Column Array: Convert HTML Table To JSON Column Array
        case 4: console.log(csvToJSONColumnArray(CSV, options));
            break;
    }
  
   }

   
   function HTMLTableToJSONGeneral(table){
    var delimiter = ",";
    var noMultiLines = true;
    var whichTable = 0;
    var forceHeader = false;
    whichTable = whichTable || "0";
    var bQuotes = false;
    var removeTags = true;
    //var html = document.createRange().createContextualFragment(table);
    //var tbl = html.firstChild;
    var tbl = $.parseHTML(table);
    var s = "";
    var cells;
    var value;
    var cnt = tbl.length;
    var re = new RegExp("<\/?\\w+((\\s+\\w+(\\s*=\\s*(?:\".*?\"|'.*?'|[^'\">\\s]+))?)+\\s*|\\s*)\/?>", 'igm');
    var headerFound = false;
    for (var j = 0; j < tbl.length; j++) {
        if (("" + (j + 1)) != whichTable && whichTable != "0") continue;
        rows = tbl[j].getElementsByTagName('tr');
        for (var k = 0; k < rows.length; k++) {
            if (k == 0) {
                cells = rows[k].getElementsByTagName('th');
                if (cells && cells.length > 0) headerFound = true;
            }
            if ('querySelectorAll' in document) {
                cells = rows[k].querySelectorAll('td,th');
            } else {
                cells = rows[k].getElementsByTagName('td');
                if (!cells || cells.length == 0) {
                    cells = rows[k].getElementsByTagName('th');
                }
            }

            for (var n = 0; n < cells.length; n++) {
                value = cells[n].innerHTML;
                if (value == null) value = ""; else value += "";
                value = value.replace(/\r\n|\r|\n/gmi, ' ');
                if (noMultiLines) value = value.replace(/\n|<br>|<br\/>|<br \/>/gmi, '\n');
                //else value = value.replace(/\r\n|\r|\n|<br>|<br\/>|<br \/>/gmi,'\n');
                if (removeTags) value = value.replace(re, '');
                value = _.unescape(value);
                value = value.replace(/&nbsp;/gmi, " ");
                value = value.trim();
                if (bQuotes) {
                    s += '"' + value.replace(/"/gmi, '""') + '"' + delimiter;
                }
                else {
                    s += value.toCsv(delimiter, '"') + delimiter;
                }
            }
            s = s.slice(0, delimiter.length * -1); // remove last delimiter
            s += "\n";
        }
    }

    var options = { "global": [] };
    options.forceWrap = false;
    options.nullIsNull = true;
    options.useFieldsData = false;
    options.fldPropName = "fields";
    options.dataPropName = "data";

    CSV.isFirstRowHeader = headerFound || forceHeader;
    CSV.parse(s);

    return csvToJSON(CSV, options)
   }

   function HTMLTableToJSONArray(table){
    var delimiter = ",";
    var noMultiLines = true;
    var whichTable = 0;
    var forceHeader = false;
    whichTable = whichTable || "0";
    var bQuotes = false;
    var removeTags = true;
    //var html = document.createRange().createContextualFragment(table);
    //var tbl = html.firstChild;
    var tbl = $.parseHTML(table);
    var s = "";
    var cells;
    var value;
    var cnt = tbl.length;
    var re = new RegExp("<\/?\\w+((\\s+\\w+(\\s*=\\s*(?:\".*?\"|'.*?'|[^'\">\\s]+))?)+\\s*|\\s*)\/?>", 'igm');
    var headerFound = false;
    for (var j = 0; j < tbl.length; j++) {
        if (("" + (j + 1)) != whichTable && whichTable != "0") continue;
        rows = tbl[j].getElementsByTagName('tr');
        for (var k = 0; k < rows.length; k++) {
            if (k == 0) {
                cells = rows[k].getElementsByTagName('th');
                if (cells && cells.length > 0) headerFound = true;
            }
            if ('querySelectorAll' in document) {
                cells = rows[k].querySelectorAll('td,th');
            } else {
                cells = rows[k].getElementsByTagName('td');
                if (!cells || cells.length == 0) {
                    cells = rows[k].getElementsByTagName('th');
                }
            }

            for (var n = 0; n < cells.length; n++) {
                value = cells[n].innerHTML;
                if (value == null) value = ""; else value += "";
                value = value.replace(/\r\n|\r|\n/gmi, ' ');
                if (noMultiLines) value = value.replace(/\n|<br>|<br\/>|<br \/>/gmi, '\n');
                //else value = value.replace(/\r\n|\r|\n|<br>|<br\/>|<br \/>/gmi,'\n');
                if (removeTags) value = value.replace(re, '');
                value = _.unescape(value);
                value = value.replace(/&nbsp;/gmi, " ");
                value = value.trim();
                if (bQuotes) {
                    s += '"' + value.replace(/"/gmi, '""') + '"' + delimiter;
                }
                else {
                    s += value.toCsv(delimiter, '"') + delimiter;
                }
            }
            s = s.slice(0, delimiter.length * -1); // remove last delimiter
            s += "\n";
        }
    }

    var options = { "global": [] };
    options.forceWrap = false;
    options.nullIsNull = true;
    options.useFieldsData = false;
    options.fldPropName = "fields";
    options.dataPropName = "data";

    CSV.isFirstRowHeader = headerFound || forceHeader;
    CSV.parse(s);

    return csvToJSONArray(CSV, options)
   }


   function createEmptyHtmlTableWithColumns(id, cols){
    //let cols = ['non', 'prenom', 'genre']
    let dtId = id +'-datatable'
    var html = '<table id='+dtId+' class="table table-hover table-bordered"  cellspacing="0" width="100%">\n';
    html += "<thead><tr class='thead-light'>";
    cols.forEach((c) => {
      html += '<th>'+c+'</th>';
    });
    html += '</tr></thead>';
    html += "<tbody>";
    html += "</tbody>";
    html += "<tfoot><tr>";
    cols.forEach((c) => {
      html += '<th>'+c+'</th>';
    });

    html += "</tr></tfoot>\n"
    html += "</table>";
    return html;
    //document.getElementById(id).innerHTML = html;
  }