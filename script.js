var city = $(".city");
var wind = $(".wind");
var humidity = $(".humidity");
var temp = $(".temp");

//array search terms are pushed to
var searchArr = [];
var APIKey = "&appid=b9330bfd0b1bf5fe0c849c27df315565";

$(document).ready(function () {
    renderSearchList();

    $("#searchBtn").click(function (event) {
        event.preventDefault();
        //grab search term from input search field
        var searchTerm = $("#search").val().trim();
        triggerSearch(searchTerm);
    })

    function triggerSearch(citySearch) {
        //construct the URL
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
            citySearch + APIKey;

        //add search term to top of list of cities
        $("<button>").text(citySearch).prepend(".list-group-item");
        //ajax call for local weather
        $.ajax({
            type: "GET",
            url: queryURL
        }).then(function (response) {
            var previousCity = JSON.parse(localStorage.getItem("cities"));
            if (previousCity) {
                previousCity.push(response.name);
                localStorage.setItem("cities", JSON.stringify(previousCity));
            } else {
                searchArr.push(response.name)
                localStorage.setItem("cities", JSON.stringify(searchArr));
            }
            //transfer content to HTML
            var cityName = $(".jumbotron").addClass("city-weather").text(citySearch + " Weather Details  ");
            var currentDate = moment().format("  MM-DD-YYYY");
            var windData = $("<p>").text("Wind Speed: " + response.wind.speed).addClass("lead");
            var humidityData = $("<p>").text("Humidity: " + response.main.humidity + "%").addClass("lead");
            var iconcode = response.weather[0].icon;
            var iconurl = "https://openweathermap.org/img/w/" + iconcode + ".png";
            var weatherImg = $("<img>").attr("src", iconurl);
            var date = $("<p>").text(moment.unix().format("MMM Do YY")).addClass("lead");
            $("#five-day").empty();
            // Convert the temp to fahrenheit
            var tempF = (response.main.temp - 273.15) * 1.80 + 32;
            var roundedTemp = Math.floor(tempF);

            //temp elements added to html
            var tempData = $("<p>").text("Temp (K): " + response.main.temp + "°").addClass("lead");
            var tempDataF = $("<p>").text("Temp (F): " + roundedTemp + "°").addClass("lead");

            //append the elements together
            cityName.append(weatherImg, currentDate, windData, humidityData, tempData, tempDataF);
            $("container").append(cityName);

            //ajax call for UV Index
            var latitude = response.coord.lat;
            var longitude = response.coord.lon;
            var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?" + APIKey + "&lat=" + latitude + "&lon=" + longitude;
            $.ajax({
                type: "GET",
                url: uvIndexURL,
            }).then(function (responseUV) {
                var currentUV = $("<div>").addClass('lead uv-index').text("UV Index: ");
                var uvValue = $("<span class='badge id='current-uv-level'>").text(responseUV.value);
                currentUV.append(uvValue);
                if (responseUV.value >= 0 && responseUV.value < 3) {
                    $(uvValue).addClass("badge-success");
                } else if (responseUV.value >= 3 && responseUV.value < 6) {
                    $(uvValue).addClass("badge-mild");
                } else if (responseUV.value >= 6 && responseUV.value < 8) {
                    $(uvValue).addClass("badge-warning");
                } else if (responseUV.value >= 8 && responseUV.value < 11) {
                    $(uvValue).addClass("badge-veryhigh");
                } else if (responseUV.value >= 11) {
                    $(uvValue).addClass("badge-danger");
                }
                cityName.append(currentUV);
                renderSearchList();
            })

            //start 5 day forecast ajax
            let day5QueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=imperial" + APIKey;

            for (var i = 1; i < 6; i++) {
                $.ajax({
                    url: day5QueryURL,
                    type: "GET"
                }).then(function (response5Day) {
                    var cardbodyElem = $("<div>").addClass("card-body");

                    var fiveDayCard = $("<div>").addClass(".cardbody");
                    var fiveDate = $("<h5>").text(moment.unix(response5Day.daily[i].dt).format("MM/DD/YYYY"));
                    fiveDayCard.addClass("headline");

                    var fiveDayTemp = $("<p>").text("Temp: " + response5Day.daily[i].temp.max + "°");
                    fiveDayTemp.attr("id", "#fiveDayTemp[i]");

                    var fiveHumidity = $("<p>").attr("id", "humDay").text("Humidity: " + JSON.stringify(response5Day.daily[i].humidity) + "%");
                    fiveHumidity.attr("id", "#fiveHumidity[i]");

                    var iconCode = response5Day.daily[i].weather[0].icon;
                    var iconURL = "https://openweathermap.org/img/w/" + iconCode + ".png";
                    var weatherImgDay = $("<img>").attr("src", iconURL);
                    $("#testImage").attr("src", iconURL);

                    cardbodyElem.append(fiveDate);
                    cardbodyElem.append(weatherImgDay);
                    cardbodyElem.append(fiveDayTemp);
                    cardbodyElem.append(fiveHumidity);
                    fiveDayCard.append(cardbodyElem);
                    $("#five-day").append(fiveDayCard);
                    $("#fiveDayTemp[i]").empty();
                    $(".jumbotron").append(cardbodyElem);
                })
            }
            $("#search").val("");

        })

    }
    $(document).on("click", ".city-btn", function () {
        JSON.parse(localStorage.getItem("cities"));
        var citySearch = $(this).text();
        triggerSearch(citySearch);
    });

    function renderSearchList() {
        var searchList = JSON.parse(localStorage.getItem("cities"));
        $("#search-list").empty();
        if (searchList) {
            for (i = 0; i < searchList.length; i++) {
                let listBtn = $("<button>").addClass("btn btn-secondary city-btn").attr('id', 'cityname_' + (i + 1)).text(searchList[i]);
                let listElem = $("<li>").attr('class', 'list-group-item');
                listElem.append(listBtn);
                $("#search-list").append(listElem);
            }

        }

    }

})