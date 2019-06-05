var handleDataTableButtons = function(id, langue, mobile) {
        "use strict";
        
        if(mobile){
            var table = 0 !== $('#'+id).length && $('#'+id).DataTable({
                //var table = $('#'+id).DataTable({
                language: langue,
                "dom": 'C<"clear">lfrtip',
                select: true,
                /*columnDefs: [
                    { targets: [0, 1, 2, 3], visible: true},
                    { targets: '_all', visible: false }
                ],*/
                responsive: !0
            });
        }else{
            var table = 0 !== $('#'+id).length && $('#'+id).DataTable({
                //var table = $('#'+id).DataTable({
                language: langue,
                dom: "Bfrtip",
                select: true,
                buttons: [
                    /*{
                        extend: 'colvis',
                        //columns: ':gt(0)',
                        //"activate": "mouseover",
                        //postfixButtons: [ 'colvisRestore' ]
                        className: "ColVis_Button ColVis_MasterButton"
                    },{
                        extend: "copy",
                        className: "btn-sm"
                    }, */{
                        extend: "csv",
                        className: "btn-sm"
                    }, {
                        extend: "excel",
                        className: "btn-sm"
                    }, {
                        extend: "pdf",
                        className: "btn-sm"
                    }, {
                        extend: "print",
                        className: "btn-sm"
                    },{
                        extend: 'colvis',
                        //columns: ':gt(0)',
                        //activate: "mouseover",
                        //postfixButtons: [ 'colvisRestore' ],
                        className: "btn-sm ColVis_Button"
                    },
                ],
                /*columnDefs: [
                    { targets: [0, 1, 2, 3], visible: true},
                    { targets: '_all', visible: false }
                ],*/
                responsive: !0
            });
        }

        return table;
    },
    TableManageButtons = function() {
        "use strict";
        return {
            init: function(id, langue, mobile) {
               return handleDataTableButtons(id, langue, mobile);
            }
        }
    }();