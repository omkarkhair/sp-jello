<!DOCTYPE html>
<html>
    <head>
<meta name="WebPartPageExpansion" content="full" />
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
                contentType: "SP.Data.TaskListListItem"
            });

            // Add item
            TaskList.add({
                Title: (new Date()).getTime().toString() + " Feed the dog",
                Status: true
            }).done(function (resp) {
                console.log("Added", resp);
            }).fail(function (err) {
                console.log("Failed because", err);
            });
            
            // Get items from list
            TaskList.get().then(function (resp) {
                console.log("Successfully got list", resp);
                
                // Try to update the first item with Timestamp
                TaskList.update(resp.d.results[0].ID, {
                	Title: (new Date()).getTime().toString()
                }).then(function(){
                	console.log("Successfully updated");
                },
                function(err) {
                	console.log("Err updating", err);
                });
                
                // Try to delete the last item
                 TaskList.remove(resp.d.results[ resp.d.results.length - 1 ].ID).then(function(){
                	console.log("Successfully deleted");
                },
                function(err) {
                	console.log("Err deleting", err);
                });
                
            }, function (err) {
                console.error("Failed because", err);
            });
            
            
        </script>
    </body>
</html>