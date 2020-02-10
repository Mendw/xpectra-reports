const fs = require('fs');
const Excel = require('exceljs');

var options = {
    filename: './docs/report.xlsx',
    useStyles: true,
    useSharedStrings: true
};

var workbook = new Excel.stream.xlsx.WorkbookWriter(options);
let sheet = workbook.addWorksheet('First WS');

let path_ = './data/'
let filename = 'data'
let files = ['0', '1', '2', '3', '4']
let counter = 0

console.time('it took')
files.forEach(file => {
    fs.readFile(`${path_}${filename}_${file}.json`, (err, data) => {
        if (err) throw err;

        let users = JSON.parse(data);
        if (!users) {
            console.error('JSON Parse Error or empty source File');
            process.exit();
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

        users.forEach(user => {
            sheet.addRow(user).commit()
        });

        //sheet.commit()
        console.log(`sheet ${file} done`)
        if (++counter == files.length) {
            workbook.commit()
                .then(() => {
                    console.timeEnd('it took')
                })
        }
    })
})