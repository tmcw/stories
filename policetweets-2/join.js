process.stdout.write(JSON.stringify(
    require('./tweets-new.json')
        .map(function (tweet) {
            return tweet['Posted at'] + ' ' + tweet.Text;
        })));
