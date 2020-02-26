const fs = require('fs');
const Excel = require('exceljs');

var options = {
    filename: './docs/report.xlsx',
    useStyles: true,
    useSharedStrings: true
};

var workbook = new Excel.stream.xlsx.WorkbookWriter(options);
let sheet = workbook.addWorksheet('First WS');

let data_file_regex = /\.json$/
let data_directory = './data'

let data_files = fs.readdirSync(data_directory, 'utf-8')
    .filter(filename => data_file_regex.test(filename))
    .map(   filename => `${data_directory}/${filename}`)

let counter = 0

data_files.forEach(filename => {
    fs.readFile(filename, (err, data) => {
        if (err) throw err;

        let users = JSON.parse(data);
        if (!users) {
            return console.error('JSON Parse Error or empty source File');
        }

        if (sheet.columns == null) {
            let keys = Object.keys(users[0]), columns = []
            for (let i = 0; i < keys.length; i++) {
                columns.push({
                    'header': keys[i].toUpperCase(),
                    'key': keys[i],
                });
            }
            sheet.columns = columns;
        }

        while(users.length > 0){
            user = users.pop()
            sheet.addRow(user).commit()
        }

        if (++counter == data_files.length) {
            workbook.commit()
                .then(() => {
                    //
                })
        }
    })
})
