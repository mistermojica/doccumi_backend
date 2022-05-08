$(function() {
    
    $('body').on('click', '#btnSubmit', function() {
        submitForm();
    });

});

var globalData = {};

function submitForm(){

    var formDataTemp = grabFormData();

    if (formDataTemp == null){
        alert("Por favor seleccione un archivo para continuar.");
    }
    else {
        showLoading();

        mlCL("submitForm || formDataTemp", formDataTemp);

        var mapFormData = new Map(Object.entries(formDataTemp));

        var formData = new FormData();

        mapFormData.forEach(function (value, key, map) {

            formData.append(key, value);

        });

        $.ajax({
            type: 'POST',
            url: "/ocrtraces/convertpdftopng",
            data: formData,
            timeout: 30000,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST'
        }).done(function(data, error){
            mlCL("submitForm || data", data);
            if (data) {
                mlCL("submitForm || data", data);
                globalData = btoa(JSON.stringify(data));
                setCookie("globalData", globalData, 1);
                hideLoading();
                window.location.href = "waiting.html";
            }
            else {
                mlCL("submitForm() || error", error);
                mlCL("submitForm() || data", data);
            }
        });
    }
}

function grabFormData(){

    if (typeof $("#filename")[0].files[0] === "undefined"){
        return null;
    }

    var formDataTemp = {
        "filename" : typeof $("#filename")[0].files[0] === "undefined" ? '' : $("#filename")[0].files[0]
    }

    return formDataTemp;
}

function mlCL(paramMsg, paramData){
    console.log(' ');
    console.log('\r\n==================');
    console.log(paramMsg);
    console.log('------------------');
    console.log(paramData);
    console.log('==================');
    console.log(' ');
}

function showLoading(){
    $.mobile.loading("show", {
        "theme": 'b',
        "text": 'Convirtiendo PDF a JSON',
        "textVisible": true,
        "textonly": false,
        "html": ""
    });
}

function hideLoading(){
    $.mobile.loading("hide");
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}