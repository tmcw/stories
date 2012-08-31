var fs = require('fs');


function simpleDate(d) {
    var h = d.getHours() + 1;
    var m = '' + d.getMinutes();
    if (m.length === 1) m = '0' + m;
    var ampm = 'am';
    if (h > 12) {
        h -= 12;
        ampm = 'pm';
    }
    h = '' + h;
    if (h.length === 1) h = '0' + h;
    return h + ':' + m + ampm + ' ' +
        (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}

fs.writeFileSync('distilled.json', JSON.stringify(JSON.parse(fs.readFileSync('tweets.json', 'utf8')).map(function(t) {
    return {
        text: t.text,
        id: t.id,
        created_at: simpleDate(new Date(t.created_at))
    };
})));
