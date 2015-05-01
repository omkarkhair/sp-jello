<!DOCTYPE html>
<html>
    <head>
        <title>Scotch for Sharepoint</title>
        <script type="text/javascript" src="//ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js"></script>
        <script src="/_layouts/15/sp.js" type="text/javascript"></script>
        <script src="jquery-2.1.3.min.js"></script>
        <script src="../lib/scotch.js"></script>
        
    </head>
    <body>
        
        <h1>Scotch for Sharepoint</h1>
        <p>I've tried to make this quick and dirty. You can find the usage for Scotch in the source of this page.</p>

        <script>
            var TaskList = new Scotch("https://jello.sharepoint.com/sites/sprest",{
                name: "TaskList",
                contentType: "SP.Data.TaskListItem"
            });

            // Add item
            TaskList.add({
                Title: "Feed the dog",
                Status: true
            }).done(function (resp) {
                console.log("Added", resp);
            }).fail(function (err) {
                console.log("Failed because", err);
            });
            
            // Get items from list
            TaskList.get().then(function (resp) {
                console.log("Successfully got list", resp);
            }, function (err) {
                console.error("Failed because", err);
            });
        </script>
    </body>
</html>