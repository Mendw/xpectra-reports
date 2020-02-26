const phantom = require('phantom')      // permite renderizar archivos HTML
const fs = require('fs');               // permite trabajar con el sistema de archivos
const ejs = require('ejs');             // permite generar codigo HTML en base a un plantilla y datos

let data_directory = './data'
let data_file_regex = /\.json$/

let template = './html/template.ejs'
let temp_file = './docs/temp.html'

let counter = 0

let ws = fs.createWriteStream(temp_file)               // crea un stream de escritura

// renderiza el código HTML para generar el reporte final
function render() {
    data = fs.readFile(temp_file, 'utf-8', (err, data) => {     // lee el codigo HTML del archivo temporal
        if (err) return console.error(err)

        phantom.create().then(ph => {                           // crea una instancia de phantom, 
            ph.createPage().then(page => {                      // crea una página
                page.property('paperSize', {                    // configura la cabecera y el pie de pagina
                    format: 'Letter',
                    header: {
                        height: "2cm",
                        contents: ph.callback(function (pageNum, numPages) {
                            return "<h6>Header <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                        })
                    },
                    footer: {
                        height: "2cm",
                        contents: ph.callback(function (pageNum, numPages) {
                            return "<h6>Footer <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                        })
                    }
                }).then(() => {                                                 
                    page.property('content', data).then(() => {                 // añade el código HTML a la página
                        page.render('./docs/report.pdf').then(() => {           // renderiza
                            ph.exit()                                           // destruye la instancia de phantom
                            cleanup()                                           // elimina el archivo temporal
                        })
                    })
                })
            })
        })
    })
}



let data_files = fs.readdirSync(data_directory, 'utf-8')
    .filter(filename => data_file_regex.test(filename))
    .map(filename => `${data_directory}/${filename}`);

data_files.forEach(filename => {
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err)
            throw err;

        rows = JSON.parse(data)
        columns = Object.keys(rows[0])
        ejs.renderFile(template, {
            rows: rows,
            columns: columns
        })
            .then(html => {
                ws.write(html, (err) => {
                    if (err) return console.error(err)

                    if (++counter == data_files.length) {
                        ws.close()
                        render()
                    }
                })
            })
    })
})


function cleanup() {
    fs.unlink(temp_file, () => {
        //
    })
}