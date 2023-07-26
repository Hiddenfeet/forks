$(document).ready(function(){
    var toggled = false;
    var button = $("#hamburger-icon");
    var modal_button1 = $("#data-modal-target");
    var modal_button2 = $("#data-modal-target2");
    var header_button = $("#connect-button");
    var icon = $("#hamburger-icon > i");
    var div = $("#header-content");
    var small_div = $("#small-header-content");

    function open_menu() {
        toggled = true;
        icon.removeClass("bi-list");
        icon.addClass("bi-x");
            
        div.removeClass("hidden");
        small_div.addClass("fixed");
    }

    function close_menu() {
        toggled = false;

        icon.removeClass("bi-x");
        icon.addClass("bi-list");
        
        div.addClass("hidden");
        small_div.removeClass("fixed");
    }


    button.click(function(){
        if (toggled === true) {
            close_menu();
        }

        else{
            open_menu();
        }
    });

    // Close menu if modal open
    modal_button1.click(function(){
        close_menu();
    });

    modal_button2.click(function(){
        close_menu();
    });

    header_button.click(function(){
        close_menu();
    });

});