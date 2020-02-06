const fs = require('fs');
const Excel = require('exceljs');

console.time('timer')
fs.readFile('./data.json', 'utf-8', (err, data) => {
    if (err) throw err;

    let users = JSON.parse(data);
    if (!users) {
        console.error('JSON Parse Error or empty source File');
        process.exit();
    }

    let keys = Object.keys(users[0]), columns = []
    for (let i = 0; i < keys.length; i++) {
        columns.push({
            'header': keys[i].toUpperCase(),
            'key': keys[i],
        });
    }

    var options = {
        filename: './docs/report.xlsx',
        useStyles: true,
        useSharedStrings: true
      };

    var workbook = new Excel.stream.xlsx.WorkbookWriter(options);

    let sheet = workbook.addWorksheet('First WS');

    sheet.columns = columns;
    users.forEach(user => {
        sheet.addRow(user).commit()
    });

    workbook.commit()
        .then(() => {
            console.timeEnd('timer')
        })
})