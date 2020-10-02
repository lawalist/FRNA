var handleDataTableButtons = function(id, columns, formData, langue, tanslate, peutExporterDonnees, filename) {
        "use strict";

        //gerer les message d'erreur du datatable
        $.fn.dataTable.ext.errMode = 'none';
        $('#'+id).on( 'error.dt', function (e, settings, techNote, message) {
            console.log(message)
        })/*.DataTable()*/

        $('#'+id+' thead tr').clone(true).appendTo( '#'+id+' thead' );
        $('#'+id).removeClass("no-footer");
        $('#'+id+' thead tr:eq(1)').removeClass("thead-light");
        $('#'+id+' thead tr:eq(1) th').each( function (i) {
            $(this).html( '<input type="search" class="form-control form-control-sm" placeholder="'+tanslate.instant('GENERAL.RECHERCHER')+'..." />' );
             
            //var title = $(this).text();
            //$(this).html( '<input type="search" class="form-control form-control-sm" placeholder="Search '+title+'" />' );
            //$(this).html( '<div class="input-group"><input type="search" title="'+title+'" class="form-control form-control-sm" placeholder="'+title+'" /><div class="input-group-append"><span class="input-group-text"><i class="fa fa-search"></i></span></div></div>' );
    
            $( 'input', this ).on( 'keyup change', function () {
                if ( table.column(i).search() !== this.value ) {
                    table
                        .column(i)
                        .search( this.value )
                        .draw();
                }
            } );
        } );

        var cols = [];
        columns.forEach((c) => {
            if(c.indexOf('/') !== -1){
                c = c.replace(new RegExp('/', 'g'), '.'); //remplacer toutes les occurence de / par . en respectant la casse 'g pour permetre a datatable de retouver les clé
            }
            cols.push({ "data": c });
        });
        
        //$('#'+id+' thead tr:eq(1)').hide();
        if(peutExporterDonnees){
            var table = 0 !== $('#'+id).length && $('#'+id).DataTable({
                //var table = $('#'+id).DataTable({
                destroy: true,
                data: formData,
                language: langue,
                lengthMenu: [[10,25,50, 100, -1], [10, 25, 50, 100, tanslate.instant('GENERAL.TOUS')]],
                dom: "Bfrtip",
                select: true,
                scrollY: "60vh",
                //scrollY: 300,
                scrollX: true,
                scrollCollapse: true,
                orderCellsTop: true,
                lengthChange: false,
                fixedHeader: true,
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
                    },*/
                    {
                        extend: "pageLength",
                        className: "btn-sm"
                    }, {
                        extend: 'colvis',
                        /*columns: function ( idx, data, node ) {
                            console.log(idx)
                        },*/
                        //columns: ':gt(0)',
                        //activate: "mouseover",
                        //postfixButtons: [ 'colvisRestore' ],
                        className: "btn-sm"
                    }, {
                        extend: "csv",
                        className: "btn-sm",
                        title: function(){
                            if(!filename){
                                filename = 'export'
                            }/*else{
                                filename = 'export_'+filename
                            }*/
                            var d = new Date();
                            var n = d.getDate()+'-'+(d.getMonth() +1)+'-'+d.getFullYear()+'_'+d.getHours()+'-'+d.getMinutes()+'-'+d.getSeconds()+'-'+d.getMilliseconds();
                            return filename+'_' + n;
                        }
                    }, {
                        extend: "excel",
                        className: "btn-sm",
                        title: function(){
                            if(!filename){
                                filename = 'export'
                            }/*else{
                                filename = 'export_'+filename
                            }*/
                            var d = new Date();
                            var n = d.getDate()+'-'+(d.getMonth() +1)+'-'+d.getFullYear()+'_'+d.getHours()+'-'+d.getMinutes()+'-'+d.getSeconds()+'-'+d.getMilliseconds();
                            return filename+'_' + n;
                        }
                    }, {
                        extend: "pdf",
                        className: "btn-sm",
                        title: function(){
                            if(!filename){
                                filename = 'export'
                            }/*else{
                                filename = 'export_'+filename
                            }*/
                            var d = new Date();
                            var n = d.getDate()+'-'+(d.getMonth() +1)+'-'+d.getFullYear()+'_'+d.getHours()+'-'+d.getMinutes()+'-'+d.getSeconds()+'-'+d.getMilliseconds();
                            return filename+'_' + n;
                        }
                    }, /*{
                        extend: "print",
                        //className: "btn-sm"
                    },*/
                    /*{
                        extend: 'selectAll',
                        action: function () {
                            table.rows( { search: 'applied' } ).select()
                        }
                    },
                    {
                        extend: 'selectNone'/*,
                        action: function () {
                            table.rows().deselect();
                        }****
                    },*/
                ],
                columns: cols,
                /*columnDefs: [
                    { targets: [-1, -2, -3, -4, -5, -6, -7], visible: false},
                   /*{ targets: [0, 1, 2, 3], visible: true},
                    { targets: '_all', visible: false }*/
                //],
                responsive: !0       
            });
        }else{
            var table = 0 !== $('#'+id).length && $('#'+id).DataTable({
                //var table = $('#'+id).DataTable({
                destroy: true,
                data: formData,
                language: langue,
                dom: 'C<"clear">lfrtip',
                select: true,
                scrollY: "60vh",
                //scrollY: 300,
                scrollX: true,
                scrollCollapse: true,
                orderCellsTop: true,
                //lengthChange: false,
                fixedHeader: true,
                columns: cols,
                /*columnDefs: [
                    { targets: [-1, -2, -3, -4, -5, -6, -7], visible: false},
                   /* { targets: [0, 1, 2, 3], visible: true},
                    { targets: '_all', visible: false }*/
                //],
                responsive: !0,
                /*initComplete: function () {
                    var i = -1;
                    
                    this.api().columns().every( function () {
                        i = i +1;
                        var column = this;
                        var select = $('<select multiple="multiple" id="'+id+i+'" placeholder="'+tanslate.instant('GENERAL.FILTRER')+'" class="form-control form-control-sm"></select>')
                            .appendTo( $(column.footer()).empty() )
                            .on( 'change', function () {
                                /*var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );******
                                var val = $(this).val();
                                var vide = false;
                                if(val.indexOf('vide') !== -1){
                                    vide = true;
                                    val[val.indexOf('vide')] = '';
                                }
                               
                                var mergedVal = val.join('|');
                                column
                                    .search( mergedVal || vide ? '^'+mergedVal+'$' : '', true, false )
                                    .draw();
                            } );
         
                        column.data().unique().sort().each( function ( d, j ) {
                            if(!d){
                                select.append( '<option value="vide">('+tanslate.instant('GENERAL.VIDE')+')</option>' )
                            }else{
                                select.append( '<option value="'+d+'">'+d+'</option>' )
                            }
                            
                        } );

                        $('#'+id+i).multipleSelect({
                              filter: true,
                              //width: 150,
                              position: 'top',
                              formatSelectAll: function () {
                                
                                return '['+tanslate.instant('GENERAL.SELECTIONNER_TOUS')+']'
                              },
                        
                              formatAllSelected: function () {
                                return tanslate.instant('GENERAL.TOUS_SELECTIONNES')
                              },
                        
                              formatCountSelected: function (count, total) {
                                return count + ' '+tanslate.instant('GENERAL.SUR').toLocaleLowerCase()+' ' + total + ' '+tanslate.instant('GENERAL.SELECTIONNES').toLocaleLowerCase()+''
                              },
                        
                              formatNoMatchesFound: function () {
                                return tanslate.instant('GENERAL.AUCTUN_RESULTAT')
                              }
                            });

                            $('.ms-parent').removeAttr("style");
                            $('.dataTables_scrollFoot').removeAttr("style");
                            $('.dataTables_scrollFoot').addClass("display-select2-dropdown-in-datatable-footer");
                    } );

                }  */ 
            });
        }

       /* if(peutExporterDonnees){
            table.on('column-visibility', function ( e, settings, colIdx, visibility ){
                if(!$('#'+id+colIdx).attr('style') && visibility){
                    $('#'+id+colIdx).multipleSelect({
                        filter: true,
                        //width: 150,
                        position: 'top',
                        formatSelectAll: function () {
                          
                          return '['+tanslate.instant('GENERAL.SELECTIONNER_TOUS')+']'
                        },
                  
                        formatAllSelected: function () {
                          return tanslate.instant('GENERAL.TOUS_SELECTIONNES')
                        },
                  
                        formatCountSelected: function (count, total) {
                          return count + ' '+tanslate.instant('GENERAL.SUR').toLocaleLowerCase()+' ' + total + ' '+tanslate.instant('GENERAL.SELECTIONNES').toLocaleLowerCase()+''
                        },
                  
                        formatNoMatchesFound: function () {
                          return tanslate.instant('GENERAL.AUCTUN_RESULTAT')
                        }
                      });
    
                      $('.ms-parent').removeAttr("style");
                }
            });    
        }
        */
        /*table.buttons().container()
        .appendTo( '#'+id+' .col-md-6:eq(0)' );*/
        //$('#'+id+' tfoot').hide();
        $( table.table().header()).children(1)[1].hidden = true;
        $( table.table().footer() ).hide();

        return table;
    },
    TableManageButtons = function() {
        "use strict";
        return {
            init: function(id, columns, formData, langue, tanslate, peutExporterDonnees, filename) {
               return handleDataTableButtons(id, columns, formData, langue, tanslate, peutExporterDonnees, filename);
            }
        }
    }();