$(document).ready(function() {
    var thisId; 

    $('#add-note-button').on('click', function() {
        $('.note-div').empty();
        thisId = $(this).attr("data-value");
        $('.modal-title').html('Notes for Article: ' + thisId);

        $.ajax({
            method: 'GET',
            url: '/articles/' + thisId
        }).done(function(data){ 
            console.log(data);
            if (data.notes && data.notes.length > 0){
                for (var i=0; i<data.notes.length; i++){
                    $('.note-div').append('<h3>' + data.notes[i].body + '</h3>');
                    $('.note-div').append('<button type="button" data-value="' + data.notes[i]._id + '" class="btn btn-danger delete-note-button pull-right btn-sm" data-dismiss="modal">X</button>');
                    $('.note-div').append('<hr>');
                }
            }else{
                $('.note-div').html("No notes yet");
            }

            $('.delete-note-button').on('click',function(){
                var buttonId = $(this).attr("data-value");
                $.ajax({
                    method: 'DELETE',
                    url: '/deleteNote/' + buttonId
                }).done(function(data) {});
            });
        });
    });

    $('.remove-article-button').on('click', function(){
        var removeId = $(this).attr("data-value");
        $.ajax({
            method: 'POST',
            url: '/removeSavedArticle',
            data: {
                articleId : removeId
            }
        }).done(function(data){
            location.reload();
        });
    });


    $('#save-note-button').on('click', function(){
        $.ajax({
            method: 'POST',
            url: '/articles/' + thisId,
            data: {
                body: $('#note-textarea').val()
            }
        }).done(function(data){
            $('#note-textarea').val('');
        });
    });




   

});