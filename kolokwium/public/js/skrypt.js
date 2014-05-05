/*jshint browser: true */
$(function () {
    // poniższa tblica obiektów może przydać się do ustalania, na które
    // województwo „kliknął” użytkownik…
    var wojewodztwa = [
        { woj: 'pomorskie', left: 173, top: 1, width: 152, height: 125 },
        { woj: 'warmińsko-mazurskie', left: 327, top: 44, width: 168, height: 102 },
        { woj: 'zachodnio-pomorskie', left: 16, top: 54, width: 143, height: 124 },
        { woj: 'podlaskie', left: 501, top: 79, width: 115, height: 171 },
        { woj: 'lubuskie', left: 26, top: 193, width: 89, height: 141 },
        { woj: 'wielkopolskie', left: 123, top: 215, width: 130, height: 123 },
        { woj: 'mazowieckie', left: 387, top: 167, width: 106, height: 205 },
        { woj: 'kujawsko-pomorskie', left: 206, top: 147, width: 138, height: 64 },
        { woj: 'łódzkie', left: 277, top: 285, width: 104, height: 101 },
        { woj: 'dolnośląskie', left: 56, top: 345, width: 140, height: 70 },
        { woj: 'lubelskie', left: 499, top: 289, width: 121, height: 151 },
        { woj: 'opolskie', left: 203, top: 395, width: 59, height: 81 },
        { woj: 'śląskie', left: 268, top: 399, width: 62, height: 156 },
        { woj: 'świętokrzyskie', left: 354, top: 389, width: 133, height: 69 },
        { woj: 'małopolskie', left: 332, top: 462, width: 121, height: 111 },
        { woj: 'podkarpackie', left: 458, top: 459, width: 109, height: 113 }
    ];
    /*
     Dostępne usługi REST-owe serwera:

     – /<województwo>
     zwraca obiekt JSON zawierający wszystkie gminy danego <województwa>

     – /<województwo>/<wyrażenie_regularne>
     zwraca obiekt JSON zawierający wszystkie gminy danego <województwa>,
     których nazwy pasują do napisu definiującego <wyrażenie_regularne>.
     */

    var mapClick = function (position) {
        var a = undefined;
        $.each(wojewodztwa, function (index) {
            if (position.top > this.top &&
                position.top < this.top + this.height &&
                position.left > this.left &&
                position.left < this.left + this.width) {
                a = this.woj;
            }
        });
        return a;


    };
    $("body").on("click", "#mapa", function (e) {
        var position = {
            top: e.pageY - $(this).position().top,
            left: e.pageX - $(this).position().left

        };

        var pos = mapClick(position);
        make_request(mapClick(position));
    });

//GEt Ajax data
    var make_request = function (woj) {
        var request;
        if (request) {
            request.abort();
        }
        var url = '/' + woj + '/';
        request = $.ajax({
            type: "GET",
            url: url

        });
        request.done(function (response, textStatus, jqXHR) {
            $("#title").remove();
            var list = $("#lista>ul");
            list.parent().before("<p id='title'>"+woj+"</p>");
            $.each(response, function () {
                list.append($("<li><a target='_blank' href='https://www.google.pl/#q=" + this.gmina +"'>" + this.gmina + "</a></li>"));
            });
        });
        request.fail(function (jqXHR, textStatus, errorThrown) {
            console.error(
                "The following error occured: " +
                    textStatus, errorThrown
            );
        });
    };
    $("body").on("click","#czysc",function () {
        $("#lista>ul").empty();
        $("#title").remove();
    });

});


