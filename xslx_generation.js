const os = require('os-utils')

var initialMemoryUsage = 100 - os.freememPercentage() * 100
var initialCPU = 0

main()

function main() {
    var profiling = setInterval(() => {
        if (!flag) {
            console.log('\tCPU\tMEM');
            flag = true
        }
        os.cpuUsage(function (v) {
            console.log(`\t${((v - initialCPU) * 100).toFixed(2) + ''}\t${(((1 - os.freememPercentage()) * 100) - initialMemoryUsage).toFixed(2)}`)
        })
    }, 100)

    console.time('total')
    console.time('startup')
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
    let files = fs.readdirSync('./data', 'utf-8')
    let counter = 0
    let flag = false

    console.timeEnd('startup')
    files.forEach(file => {
        fs.readFile(`${path_}${file}`, (err, data) => {
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

            users.forEach(user => {
                sheet.addRow(user).commit()
            });

            //sheet.commit()
            if (++counter == files.length) {
                workbook.commit()
                    .then(() => {
                        clearInterval(profiling)
                        console.timeEnd('total')
                    })
            }
        })
    })
}