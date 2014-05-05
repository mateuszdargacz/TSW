domReady(function () {
    var handleCtrlClick = function (elem, event) {

        if (event.ctrlKey) {
            if (elem.getAttribute("ctr_state") === "true")
                while (elem.nextElementSibling) {
                    if (elem.nextElementSibleentSibling.className == "bd")
                        elem.style.display = "none";
                }
            else
                while (elem.nextElementSibling) {
                    if (elem.nextElementSibleentSibling.className == "bd")
                        elem.style.display = "none";
                }
        }
    }
    var harmony = function (selector) {
        var headers = document.querySelectorAll(selector + ">.hd")
        for (var i = 0; i < headers.length; i++) {

            headers[i].nextElementSibling.style.display += "none";
            headers[i].setAttribute('state', 'hidden')

            headers[i].onclick = function (e) {
                handleCtrlClick(this, e);
                if (this.getAttribute("state") === "hidden") {
                    this.nextElementSibling.style.display = "block";
                    this.setAttribute('state', 'shown');
                } else {
                    this.nextElementSibling.style.display = "none";
                    this.setAttribute('state', 'hidden');
                }
            }
            headers[i].onmouseover = function () {
                this.nextElementSibling.style.display = "block";
            }
            headers[i].onmouseout = function () {
                if (this.getAttribute("state") === "hidden")
                    this.nextElementSibling.style.display = "none";

            }
        }

    }

    harmony("body");
});
