export var global = {

    //id_boutique: 'VIDE!',
    estUtilisateur: (roles) => {
        //un admin et un moderateur sont des utilisateur
        return (roles.indexOf('user') !== -1) || (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    estModerateur: (roles) => {
        //un admin est un moderateur
        return (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    estAmin: (roles) => {
       return (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    estAdmin: (roles) => {
       return (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    estPersonnel: (roles) => {
        //un admin et un moderateur sont des personnels
        return (roles.indexOf('personnel') !== -1) || (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    estAnimataire: (roles) => {
        //un admin et un moderateur sont des animataires
        return (roles.indexOf('animataire') !== -1) || (roles.indexOf('technicien') !== -1) ||  (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    estTechnicien: (roles) => {
      //un admin et un moderateur sont des animataires
      return (roles.indexOf('technicien') !== -1) || (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
  },
    peutAjouter: (roles) => {
        //tout le monde sauf les utilisateur et les personnels peuvent ajouter des essais et des membres
        return (roles.indexOf('animataire') !== -1) || (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    peutModifier: (roles) => {
        //tout le monde sauf les utilisateur et les personnels peuvent modifier des essais et des membres
        return (roles.indexOf('animataire') !== -1) || (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    estManager: (roles) => {
        //Seuls les admin et les moderateurs peuvent supprimer quoi que ce soit dans la base
        //Cette fonction sera aussi utilisée pour les autorisations pour la gestion des Unions, Ops, localité, les variété, les protocoles
        return (roles.indexOf('moderateur') !== -1) || (roles.indexOf('_admin') !== -1) || (roles.indexOf('admin') !== -1)
    },
    
    premierLancement: true,
    langue: 'fr',
    dataTable_fr: {
      "sProcessing":     "Traitement en cours...",
      "sSearch":         "Rechercher&nbsp;:",
      "sLengthMenu":     "Afficher _MENU_ &eacute;l&eacute;ments",
      "sInfo":           "Affichage de l'&eacute;l&eacute;ment _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
      "sInfoEmpty":      "Affichage de l'&eacute;l&eacute;ment 0 &agrave; 0 sur 0 &eacute;l&eacute;ment",
      "sInfoFiltered":   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
      "sInfoPostFix":    "",
      "sLoadingRecords": "Chargement en cours...",
      "sZeroRecords":    "Aucun &eacute;l&eacute;ment &agrave; afficher",
      "sEmptyTable":     "Aucune donn&eacute;e disponible dans le tableau",
      "oPaginate": {
          "sFirst":      "Premier",
          "sPrevious":   "Pr&eacute;c&eacute;dent",
          "sNext":       "Suivant",
          "sLast":       "Dernier"
      },
      "oAria": {
          "sSortAscending":  ": activer pour trier la colonne par ordre croissant",
          "sSortDescending": ": activer pour trier la colonne par ordre d&eacute;croissant"
      },
      "select": {
            "rows": {
                _: "%d lignes séléctionnées",
                0: "Aucune ligne séléctionnée",
                1: "1 ligne séléctionnée"
            } 
      },
      "buttons": {
        "copy": "Copier",
        "print": "Imprimer",
        "colvis": "Visibilité colonne",
        "selectAll": "Sélectionner tous",
        "selectNone": "Ne pas sélectionner",
        pageLength: {
            _: "Afficher %d éléments",
            '-1': "Tout afficher"
        }
      }
    },
    formio_fr: {
        'Submit': 'Terminer',
        'submit': 'Terminer',
        'cancel': 'Annuler',
        'complete': 'Terminé avec succès',
        'error' : "Veuillez corriger les erreurs suivantes avant de termier.",
        'invalid_date' :"{{field}} is not a valid date.",
        'invalid_email' : "{{field}} must be a valid email.",
        'invalid_regex' : "{{field}} does not match the pattern {{regex}}.",
        'mask' : "{{field}} does not match the mask.",
        'max' : "{{field}} ne peut pas être supérieur à {{max}}.",
        'maxLength' : "{{field}} doit être plus court que {{length}} charactères.",
        'min' : "{{field}} ne peut pas être inférieur à {{min}}.",
        'minLength' : "{{field}} doit être plus long que {{length}} charactères.",
        'next' : "Suivant",
        'pattern' : "{{field}} does not match the pattern {{pattern}}",
        'previous' : "Précédent",
        'required' : "{{field}} est requis"
    },
    dataTable: true,
    peutExporterDonnees: true,
    mobile: false,
    selectedIndexes: [],
    estConnecte: false,
    remoteSaved: null,
    //info_user: null,
    info_user: {
      name: 'default',
      codes_unions: [],
      codes_ops: [],
      codes_protocoles: [],
      sites: [],
      annees_essais: [],
      roles: []
    },
    info_connexion: null,
    config_app: {
        num_aggrement: null,
        nom_structure: null,
        code_structure: null,

    },
    info_db:{
        ip: '@ip:5984',
        nom_db: 'nom_db',// 'fuma_frn_app',
        mode_connexion: 'ofline_online'
    } 
}