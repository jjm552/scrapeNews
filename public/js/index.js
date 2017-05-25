$(document).ready(function() {
    //click event to kick off the scraping
    $('#scrape-news-button').on('click', function() {
        $.get('/scrape', function(data) {
            location.reload();
        });
    });


    var thisId; //id of the current article
    //click event to add a note to the article
    $('#addButton').on('click', function() {
        // $('#noteModal').modal('show');
        $('.note-div').empty();
        thisId = $(this).attr("data-value");
        $('.modal-title').html('Notes for Article: ' + thisId);
    });

});