const createPhantomPool = require('phantom-pool')           // agiliza el proceso de renderizado de varios archivos HTML
const async = require('asyncawait/async');                  // junto con await...
const await = require('asyncawait/await');                  // ...permite trabajar con funciones asíncronas en Node 6 
const fs = require('fs');                                   // permite trabajar con el sistema de archivos
const ejs = require('ejs');                                 // permite generar codigo HTML en base a un plantilla y datos
const merge = require('easy-pdf-merge');                    // permite combinar varios archivos .pdf 

let temp_pdf_regex = /temp_.+\.pdf$/
let data_file_regex = /.+\.json$/

let document_directory = './docs'
let data_directory = './data'

let template = './html/template.ejs'

let counter = 0
let filename_suffix = 0

// crea una pool de instancias de phantom para agilizar el proceso de renderizado de archivos HTML
const pool = createPhantomPool({    // configuración la 'pool' de instancias de phantom
    max: 10,                        // cantidad maxima de instancias de phantom en la pool
    min: 2,                         // cantidad minima, inicial de instancias de phantom en la pool
    idleTimeoutMillis: 30000,       // tiempo en milisegundos que una instacia de phantom puede mantenerse desocupada antes de ser destruida
    maxUses: 50,                                                        // cantidad de veces que se puede usar una instancia de phantom antes de destruirla, 0 desactiva esta opción
    validator: resource => Promise.resolve(true),                       // función que se ejecuta para asegurarse que una instancia puede ser usada antes de usarla, por defecto siempre resuelve a 'true'
    testOnBorrow: true,                                                 // determina si las instancias se prueban antes de usarse, afecta a 'maxUses' y a 'validator'
    phantomArgs: [['--ignore-ssl-errors=true', '--disk-cache=true'],    // argumentos que se le pasan a phantomjs-node, para una lista completa ver: https://phantomjs.org/api/command-line.html
    ],
})

// combina los archivos temporales para crear el reporte final y luego elimina los archivos temporales.
function merge_pdfs(pathArray, output) {            // recibe un arreglo de rutas relativas a archivos .pdf y el nombre del archivo de salida
    merge(pathArray, output, (err) => {             // usa la función merge de la librería 'easy-pdf-merge' para combinar los archivos
        if (err)
            return console.log(err)

        pathArray.forEach(file => {
            fs.unlinkSync(file)
        })
    })

}

// crea una lista de rutas relativas a archivos de datos
let data_files = fs.readdirSync(data_directory, 'utf-8')        // lee el directorio de datos, creando una lista de nombres de archivos y carpetas
    .filter(filename => data_file_regex.test(filename))         // elimina todos los nombres que no cumplan con la expresión regular
    .map(filename => `${data_directory}/${filename}`);        // crea rutas relativas en base al nombre de cada archivo

data_files.forEach(filename => {                                // lee cada archivo del arreglo creado arriba
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) return console.error(err);

        rows = JSON.parse(data)                                 // extrae las filas
        columns = Object.keys(rows[0])                          // y las columnas

        ejs.renderFile(template, {                              // crea codigo HTML en base a una plantilla
            rows: rows,
            columns: columns
        })
            .then(html => {                                     // lo renderiza usando phantom
                pool.use(async((phantom) => {                   // obtiene una instancia de phanto de la pool
                    const page = await(phantom.createPage())
                    page.property('paperSize', {
                        format: 'Letter',
                        header: {
                            height: "2cm",
                            contents: phantom.callback(function (pageNum, numPages) {
                                return "<h6>Header <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                            })
                        },
                        footer: {
                            height: "2cm",
                            contents: phantom.callback(function (pageNum, numPages) {
                                return "<h6>Footer <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                            })
                        }
                    })                                                                          // configura la página
                    await(page.property('content', html))                                       // añade el contenido
                    await(page.render(`${document_directory}/temp_${filename_suffix++}.pdf`))             // renderiza
                }))
                    .then(() => {
                        if (++counter == data_files.length) {                                   // una vez que ha terminado de renderizar todo
                            pool.drain().then(() => pool.clear())                               // destruye la pool
                            merge_pdfs(                                                         // combina los archivos .pdf creados
                                fs.readdirSync(document_directory, 'utf-8')                     // cuyos nombres son extraidos de la lectura del directorio donde se guardan
                                    .filter(filename => temp_pdf_regex.test(filename))          // se usa una expresion regular para obtener solo los archivos .pdf temporales
                                    .map(filename => document_directory + '/' + filename),
                                document_directory + '/' + 'legacy_report.pdf')                 // el nombre del archivo de salida. se guarda en el directorio de documentos.
                        }
                    })

            })
    })
})


