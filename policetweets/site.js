var list = document.getElementById('list');
var graph = document.getElementById('graph');
var q = document.getElementById('q');
var searchbox = document.getElementById('search');
var about = document.getElementById('about');

distilled = distilled.reverse();


for (var i = 0; i < distilled.length; i++) {
    var d = list.appendChild(document.createElement('div'));
    d.className = 'tweet';

    var a = d.appendChild(document.createElement('a'));
    a.className = 'date';
    a.innerHTML = distilled[i].created_at;
    a.href = 'https://twitter.com/DCPoliceDept/status/' + distilled[i].id;

    var p = d.appendChild(document.createElement('p'));
    p.innerHTML = distilled[i].text;
    distilled[i].d = d;
    distilled[i].p = p;
    distilled[i].state = 'shown';
}

var ss_max = function(x) {
    var max;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, min is
        // undefined and is thus made the minimum element in the array
        if (x[i] > max || max === undefined) max = x[i];
    }
    return max;
};

function setGraph(data) {
    while (graph.firstChild) graph.removeChild(graph.firstChild);
    var values = [];
    for (var i = 0; i < data.length; i++) values.push(data[i][1]);
    var max = ss_max(values);
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

searchbox.onkeyup = function() {
    search(this.value);
};

function search(value) {
    if ('history' in window && 'replaceState' in window.history) {
        window.history.replaceState({}, '', '#' + encodeURIComponent(value));
    } else {
        window.location.hash = encodeURIComponent(value);
    }
    var r = new RegExp(value, 'i');
    var matches = [];
    function highlight(match) {
        return '<em>' + match + '</em>';
    }
    for (var i = 0; i < distilled.length; i++) {
        if (!r.test(distilled[i].text)) {
            if (distilled[i].d.state != 'hidden') {
                distilled[i].d.className = 'tweet hide';
                distilled[i].d.state = 'hidden';
                distilled[i].p.innerHTML = distilled[i].text;
            }
        } else {
            var m = distilled[i].text.match(r);
            if (m[1]) matches.push('' + m[1].toLowerCase());
            if (distilled[i].d.state !== 'shown') {
                distilled[i].d.className = 'tweet';
            }
            distilled[i].d.state = 'shown';
            distilled[i].p.innerHTML = distilled[i].text.replace(r, highlight);
        }
    }
    var counts = {};
    for (var j = 0; j < matches.length; j++) {
        counts[matches[j]] = counts[matches[j]] ?
            counts[matches[j]] + 1 : 1;
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
}

about.onclick = function() {
    about.style.display = 'none';
};

q.onclick = function() {
    about.style.display = 'block';
};

function hashUpdate() {
    searchbox.value = decodeURIComponent(window.location.hash.substring(1));
    search(searchbox.value);
    about.style.display = 'none';
}

if (window.location.hash && window.location.hash !== '#') {
    hashUpdate();
}
if ('onhashchange' in window) {
    window.onhashchange = hashUpdate;
}
