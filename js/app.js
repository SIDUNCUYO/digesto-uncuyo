Vue.component('paginate', VuejsPaginate);
Vue.config.silent = false;
Vue.config.devtools = true;

const conf = {
    facets: {
        'tipo_str': 'Tipo',
        'publishDate': 'Año',
        'dep_aplicacion_str': 'Aplicado',
        'dep_genera_str': 'Generado',
        'categoria_str': 'Categoría',
        // 'estado_str': 'Estado'

    },
    apiurl: 'https://bibliotecas.uncuyo.edu.ar/explorador3/api/v1/search',
    urlrecords: 'https://www.uncuyo.edu.ar/filesd/'
};
//
/*
other s
'http://repositoriosdigitales.mincyt.gob.ar/vufind/api/v1/search' https://bibliotecas.uncuyo.edu.ar/explorador3/api/v1/search 
 'http://repositoriosdigitales.mincyt.gob.ar/vufind/Record/' // 'http://www.lareferencia.info/vufind/Record/' ,
*/

var app = new Vue({
    el: '#app',

    data() {
        return {
            buscar: '',
            pagination: 'pagination',
            prev: "<<",
            next: ">>",
            pagecount: 0,
            loading: false,
            found: 0,
            respuesta: [],
            records: [],
            errorencarga: false,
            facets: [],
            filters: ['building:DigestoUNCUYO', 'record_format:digesto'],
            titfilters: [],
            facettitles: conf.facets, // Object.values(conf.facets)
            filtrosextras: false,
            propias: false,
            page: 1,
            urlrecords: conf.urlrecords
        }
    },
    mounted:function(){
        this.buscar=''
        this.dbuscar(1)
    },
    methods: {
        formatfecha: function(f) {
            const parts = f.split('-');
            if (parts.length != 3) return f;
            if (f.length === 10)
                return f.split('-').reverse().join('/');
            else return f;
        },
        showmore: function(e, que) {
            $(e.target).toggle();
            $('.' + que).toggle('slow');

        },
        delfilter: function(indexfilter) {
            
            this.filters = arrremove(this.filters, indexfilter + 2);
            this.titfilters = arrremove(this.titfilters, indexfilter);
            this.dbuscar(0);
            
        },
        resetfilters: function() {
            this.filters = ['building:DigestoUNCUYO', 'record_format:digesto'];
            this.titfilters = [];
            this.dbuscar(0);
        },
        changepage: function(page) {
            this.page = page;
            
            this.$refs.paginartop.selected=page-1 ; //(page);
            
            this.$refs.paginarbottom.selected=page-1
            this.dbuscar(page);

        },
        addfilter: function(value, field) {

            let k = conf.facets[field] + ": " + value;
            let v = field + ":\"" + value + "\"";

            this.filters.push(v);
            this.titfilters.push(k);
            this.dbuscar();


        },
        dbuscar: function(page) {
            this.loading = true;
            //bibliotecas.uncu.edu.ar/explorador3 //localhost/vufind
            //const url = 'https://bibliotecas.uncuyo.edu.ar/explorador3/api/v1/search';




            // let filtros = this.filter; 
            //this.filters.push('estado_str:3');
            axios.get(conf.apiurl, {
                    crossDomain: true,
                    params: {
                        lookfor: this.buscar,
                        filter: this.filters,
                        facet: Object.keys(conf.facets),
                        field: ['id',
                            'rawData',
                            'secondaryAuthors', 'title', 'subjects', 'formats', 'humanReadablePublicationDates'
                        ],
                        type: 'AllFields',
                        sort: 'year',
                        page: page,
                        limit: 20,
                        prettyPrint: false,
                        lng: 'es'
                    }
                })
                .then((response) => {
                    this.errorencarga = false;
                    this.respuesta = response.data;
                    this.loading = false;
                    this.found = response.data.resultCount;
                    if (this.found == 0) {
                        this.records = [];
                        this.facets = [];
                        this.pagecount = 0;
                        alert('Nada encontrado con el filtro usado');
                    } else {
                        this.records = response.data.records;
                        this.facets = response.data.facets;
                        //console.table(this.facets);
                        this.pagecount = Math.floor(response.data.resultCount / 20);
                    }

                })
                .catch((error) => {
                    this.errorencarga = true;
                });
        }
    }
})



function arrremove(arrOriginal, elementToRemove) {
    return arrOriginal.filter(function(i, el) { return el !== elementToRemove });
}