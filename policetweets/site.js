var list = document.getElementById('list');
var graph = document.getElementById('graph');
var q = document.getElementById('q');
var searchbox = document.getElementById('search');
var about = document.getElementById('about');

distilled = distilled.reverse();

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
        d.getMonth() + '/' + d.getDate() + '/' + d.getFullYear();
}

for (var i = 0; i < distilled.length; i++) {
    distilled[i].date = new Date(distilled[i].created_at);
    var d = list.appendChild(document.createElement('div'));
    d.className = 'tweet';
    var s = d.appendChild(document.createElement('span'));
    s.className = 'date';
    var p = d.appendChild(document.createElement('p'));
    s.innerHTML = simpleDate(distilled[i].date);
    p.innerHTML = distilled[i].text;
    distilled[i].d = d;
    distilled[i].p = p;
}

function setGraph(data) {
    graph.innerHTML = '';
    var values = [];
    for (var i = 0; i < data.length; i++) values.push(data[i][1]);
    var max = ss.max(values);
    var scale = function(x) {
        return 100 * x / max;
    };
    for (var j = 0; j < data.length; j++) {
        var tr = graph.appendChild(document.createElement('tr'));
        var td = tr.appendChild(document.createElement('td'));
        var th = tr.appendChild(document.createElement('th'));
        var d = td.appendChild(document.createElement('div'));
        d.className = 'bar';
        d.style.width = scale(data[j][1]) + '%';
        d.title = data[j][1] + ' occurrences';
        th.innerHTML = data[j][0];
    }
}

var last = '';
searchbox.onkeyup = function(e) {
    var r;
    if (this.value.indexOf('/') === 0) {
        r = new RegExp(this.value, 'i');
    } else {
        r = new RegExp(this.value, 'i');
    }
    var matches = [];
    for (var i = 0; i < distilled.length; i++) {
        var m = distilled[i].text.match(r);
        if (!m) {
            distilled[i].d.className = 'tweet hide';
            distilled[i].p.innerHTML = distilled[i].text;
        } else {
            if (m[1]) matches.push('' + m[1].toLowerCase());
            distilled[i].d.className = 'tweet';
            distilled[i].p.innerHTML = distilled[i].text.replace(
                r, function(match) {
                    return '<em>' + match + '</em>';
            });
        }
    }
    var counts = {};
    for (var i = 0; i < matches.length; i++) {
        counts[matches[i]] = counts[matches[i]] ?
            counts[matches[i]] + 1 : 1;
    }
    var rows = [];
    for (var x in counts) {
        rows.push([x, counts[x], parseInt(sz(x), 10)]);
    }
    function sz(x) {
        return ('' + x).replace(/^0*/, '');
    }
    rows.sort(function(a, b) {
        if (!(isNaN(a[2]) || isNaN(b[2]))) {
            return a[2] - b[2];
        } else {
            return a[0] > b[0];
        }
    });
    setGraph(rows);
};

about.onclick = function() {
    about.style.display = 'none';
};

q.onclick = function() {
    about.style.display = 'block';
};
