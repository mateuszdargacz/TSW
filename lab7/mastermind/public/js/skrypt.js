$(document).ready(function () {
    var gameInProgress = false;
    var startGame = function (size, dim, max) {
        var request;
        if (request) {
            request.abort();
        }
        var url = "/play/size///dim///max///".format();
        request = $.ajax({
            type: "GET",
            url: url,
            data: {
                'claimcost': claimcost,
                'pk': liquidatorclaim_id,
                'csrfmiddlewaretoken': '{{ csrf_token }}'
            },
            dataType: 'json'
        });
        request.done(function (response, jqXHR) {
            $(claimcost_mess).removeAttr('style');
            $(".claimcost_save[data-id='" + liquidatorclaim_id + "']").after(response.template);
            $('#claimcost_info-' + liquidatorclaim_id).delay(2000).fadeOut('slow');
        });
        request.fail(function (jqXHR, errorThrown) {
            // log the error to the console
            console.error(
                "The following error occured: " +
                    errorThrown
            );
        });
        request.always(function () {
            $("#load_claimcost-" + liquidatorclaim_id).removeClass('loading');
        });

    };
    var handleForm = function () {

        $("#game_form").submit(function (e) {
            e.preventDefault();
            self = $(this);
            var size = self.find("input[name='size']");
            var dim = self.find("input[name='size']");
            var max = self.find("input[name='size']");
            if (gameInProgress != true || confirm("Na pewno? gra w toku...")) {
                startGame(size, dim, max);
            }
            return false;
        });
    };
    handleForm();
});