const fs = require('fs');               // permite trabajar con el sistema de archivos
const Excel = require('exceljs');       // permite crear y modificar hojas de cálculo en varios formatos

var options = {                         // para trabajar con streams en exceljs se requiere configurar el stream al abrirlo. para una descripción detallada de todas las opciones: https://www.npmjs.com/package/exceljs#streaming-xlsx-writer
    filename: './docs/report.xlsx',     // nombre del archivo de salida
};

var workbook = new Excel.stream.xlsx.WorkbookWriter(options);       // maneja un stream a un Workbook de excel
let sheet = workbook.addWorksheet('Reporte');                       // agrega una hoja al Workbook llamada 'Reporte'

let data_file_regex = /\.json$/
let data_directory = './data'

// crea una lista de rutas relativas a archivos de datos
let data_files = fs.readdirSync(data_directory, 'utf-8')        // lee el directorio de datos, creando una lista de nombres de archivos y carpetas
    .filter(filename => data_file_regex.test(filename))         // elimina todos los nombres que no cumplan con la expresión regular
    .map(  filename => `${data_directory}/${filename}`);        // crea rutas relativas en base al nombre de cada archivo

let counter = 0

data_files.forEach(filename => {                    // lee cada archivo de datos
    fs.readFile(filename, (err, data) => {
        if (err) throw err;

        let users = JSON.parse(data);               // obtiene los datos del archivo
        if (!users) {
            return console.error('JSON Parse Error or empty source File');
        }

        if (sheet.columns == null) {                // si no se han agregado columnas la hoja, se extraen del arreglo de datos
            let keys = Object.keys(users[0]), columns = []
            for (let i = 0; i < keys.length; i++) {
                columns.push({
                    'header': keys[i].toUpperCase(),
                    'key': keys[i],
                });
            }
            sheet.columns = columns;
        }

        while(users.length > 0){                // se extraen usuarios del arreglo de datos
            user = users.pop()                  // Array.pop() elimina el elemento extraido, ahorrando memoria
            sheet.addRow(user).commit()         // al llamar a la función commit de la fila se libera la memoria asociada a esa fila, ahorrando más memoria.
        }

        if (++counter == data_files.length) {       // una vez que se agota la fuente de datos
            workbook.commit()                       // se llama a la función commit del workbook, que guarda el archivo en base a la configuración
                .then(() => {
                                                    // código que se ejecuta tras guardar el archivo, en el momento ninguno
                })
        }
    })
})
