exports.index = function (req, res) {
    req.session.puzzle = req.session.puzzle || req.app.get('puzzle');
    res.render('index', {
        title: 'Mastermind'
    });
};

exports.play = function (req, res) {

    var newGame = function () {
        var i, data = [],
            puzzle = req.session.puzzle;
        for (i = 0; i < puzzle.size; i += 1) {
            data.push(Math.floor(Math.random() * puzzle.dim));
        }
        req.session.puzzle.data = data;
        return {
            "retMsg": "coś o aktualnej koniguracji…"
        };
    };
    // poniższa linijka jest zbędna (przy założeniu, że
    // play zawsze używany będzie po index) – w końcowym
    // rozwiązaniu można ją usunąć.
    req.session.puzzle = req.session.puzzle || req.app.get('puzzle');
    /*
     * req.params[2] === wartość size
     * req.params[4] === wartość dim
     * req.params[6] === wartość max
     */
    if (req.params[2]) {
        req.session.puzzle.size = req.params[2];
    }
    res.json(newGame());
};

exports.mark = function (req, res) {
    var markAnswer = function () {
        var move = req.params[0].split('/');
        move = move.slice(0, move.length - 1);
        console.log(move);
        return {
            "retVal": "tutaj – zamiast tego napisu – ocena",
            "retMsg": "coś o ocenie – np „Brawo” albo „Buuu”"
        };
    };
    res.json(markAnswer());
};
