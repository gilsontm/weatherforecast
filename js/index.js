
// Listener que executará a função quando o documento estiver carregado.
$(document).ready(function(){
  var week_days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  var last_list = [];
  var current_day = (new Date()).getDate();
  var standart_icon = "<img class='pull-right' src='http://openweathermap.org/img/w/03d.png'/>";

  // Função que adiciona ao HTML os dados de um dos próximos cinco dias.
  function setNextDays(data, id, date){
    var title = week_days[date.getDay()] + " <small class='text-muted'>" + getShortDate(date).slice(0, 5) + "</small>"
    var icon = "<img class='pull-right' src='http://openweathermap.org/img/w/" + data.weather[0].icon + ".png'/>";
    $("." + id).find(".title-box").html(title);
    $("." + id).find(".title-box").append(icon);

    $("." + id).find(".description").html("Descrição: " + (data.weather[0].description).toLowerCase());
    $("." + id).find(".min-max").html("Temperatura: " + data.main.temp_min + "º a " + data.main.temp_max + "º");
    $("." + id).find(".humidity").html("Umidade: " + data.main.humidity + "%");

    $("." + id).find(".more-info").prop("disabled", false);
  }

  // Função que será executada quando algum dos próximos cinco dias
  // não possuir previsão.
  function setUnavailableNextDays(id){
    $("." + id).find(".title-box").html("Indisponível");
    $("." + id).find(".title-box").append(standart_icon);

    $("." + id).find(".description").html("Indisponível");
    $("." + id).find(".min-max").html("Indisponível");
    $("." + id).find(".humidity").html("Indisponível");

    $("." + id).find(".more-info").prop("disabled", true);
  }

  // Função que adiciona ao pop-up os dados de um determinado horário.
  function setAvailableInfo(card_class, index){
    var icon = "<img class='pull-right' src='http://openweathermap.org/img/w/" + last_list[index].weather[0].icon + ".png'/>";
    $(card_class).find(".card-title").html(last_list[index].dt_txt.slice(10, 16));
    $(card_class).find(".card-title").append(icon);
    $(card_class).find(".min").html("Mínima: " + last_list[index].main.temp_min + "º");
    $(card_class).find(".max").html("Máxima: " + last_list[index].main.temp_max + "º" );
    $(card_class).find(".humidity").html("Umidade: " + last_list[index].main.humidity + "%");
  }

  // Função que será executada caso algum horário não apresente previsão.
  function setUnavailableInfo(card_class){
    $(card_class).find(".card-title").html("Previsão não encontrada");
    $(card_class).find(".min").html("Indisponível");
    $(card_class).find(".max").html("Indisponível");
    $(card_class).find(".humidity").html("Indisponível");
  }

  // Função que preenche o pop-up de 'mais informações' com os dados corretos
  // do dia correspondente.
  function setMoreInfo(day_id){
    var title_text = $(".day-" + day_id + "-info").find(".title-box").html();

    $("#more-info-modal").find(".modal-title").html(title_text);
    $("#more-info-modal").find(".modal-title").append(
      "<button type='button' class='close pull-right' aria-label='Close' data-dismiss='modal'> \
        <span aria-hidden='true'>&times;</span> \
        </button>");

    var day_date = title_text.split(">")[1].slice(0, 2);
    var index = 0;
    while (day_date != last_list[index].dt_txt.slice(8, 10)){
      index++;
    }
    var i = 1;
    while (i <= 8){
      if (index < 40) {
        setAvailableInfo(".card-" + i, index);
      } else {
        setUnavailableInfo(".card-" + i);
      }
      index++;
      i++;
    }
  }

  // Função que retorna uma data no modelo DD/MM Seg[unda-feira].
  function getShortDate(date){
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    return day + "/" + month + " " + week_days[date.getDay()].slice(0, 3);
  }

  // Função que exibirá um pop-up caso alguma das requisições AJAX apresentar
  // algum erro.
  function requestError(){
    $("#error-modal").modal("show");
    $("#collapse").collapse("hide");
    $("#get-city").val("");
  }

  // Função que, quando chamada, executará as requisições AJAX.
  function ajaxCalls(){
    $("#collapse").collapse("hide");
    var city = $("#get-city").val() + ",BR";

    // Requisição AJAX para a previsão do dia atual.
    $.ajax({
      method: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather",
      data: {
        q: city,
        lang: "pt",
        units: "metric",
        APPID: "da4ab94625497016f82d068b8e40a5f0"
      },
      dataType: "json",

      success: function(response) {
        if (response.cod == "404"){
          requestError();
          return;
        }

        var title = response.name + "<small class='text-muted'> Hoje </small>";
        var icon = "<img class='pull-right' src='http://openweathermap.org/img/w/" + response.weather[0].icon + ".png'/>";
        $(".day-0-info").find(".title-box").html(title);
        $(".day-0-info").find(".title-box").append(icon);
        $(".day-0-info").find(".description").html("Descrição: " + (response.weather[0].description).toLowerCase());
        $(".day-0-info").find(".min").html("Mínima: " + response.main.temp_min + "°");
        $(".day-0-info").find(".max").html("Máxima: " + response.main.temp_max + "°");
        $(".day-0-info").find(".humidity").html("Umidade: " + response.main.humidity + "%");
      },
      error: function(response) {
        requestError();
        return;
      }
    });

    // Requisição AJAX para a previsão dos cinco próximos dias.
    $.ajax({
      method: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast",
      data: {
        q: city,
        lang: "pt",
        units: "metric",
        APPID: "da4ab94625497016f82d068b8e40a5f0"
      },
      dataType: "json",
      success: function(response) {
        if (response.cod == "404"){
          requestError();
          return;
        }
        var index = 0;
        while (response.list[index].dt_txt.slice(8, 10) == current_day){
          index++;
        }
        while (response.list[index].dt_txt.slice(11, 16) != "15:00"){
          index++;
        }

        var i = 0;
        while (i <= 4){
          if (index < response.list.length) {
            var date = new Date(response.list[index].dt_txt.slice(0, 10));
            date.setDate(date.getDate() + 1);
            setNextDays(response.list[index], "day-" + (i + 1) + "-info", date);
          } else {
            setUnavailableNextDays("day-" + (i + 1) + "-info");
          }
          index += 8;
          i++;
        }
        $("#collapse").collapse("show");
        last_list = response.list;
      },
      error: function(response) {
        requestError();
        return;
      }
    });
  }

  // Listener que chama a função 'ajaxCalls' quando o botão inicial é clicado.
  $("#button-city").click(function(){
    ajaxCalls();
  });

  // Listener que chama a função 'ajaxCalls' quando a tecla 'enter'
  // é pressionada.
  $("#get-city").keyup(function(e){
    if (e.keyCode == 13){
      ajaxCalls();
    }
  });

  // Listener que chama a função que exibirá as informações de um
  // dia específico por horários.
  $(".more-info").click(function(event){
    var id = event.target.id;
    setMoreInfo(id.slice(-1));
    $("#more-info-modal").modal("show");
  });
});
