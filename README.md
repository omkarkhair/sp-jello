# Jello for Sharepoint
This is a quick and dirty library, built to consume Sharepoint REST API for list manipulation. You are bound to notice a few issues or limitations. Please use the github issue list to add any issues or features you would like to have in Jello.

## Why use Jello?
Jello is designed to make developing on Sharepoint lists using REST API fun. It is attempt to help developers build apps (esp. single page applications) that work with Sharepoint lists focus on business logic.

## Getting started
Jello is easy to use. With the first few releases we are focusing on REST API with Sharepoint lists only. Jello has dependencies on `SP.js` and `jquery`. Make sure you have them loaded in your page before starting to consume Jello.

### Initialize on a list
To initialize Jello on a Sharepoint list, you need to provide the `siteUrl` and `listOptions` respectively. The returned Jello object can then be used to perform operations on the list.
```javascript
var TaskList = new Jello("https://contoso.sharepoint/sites/mysubsite",{
    name: "TaskList", // list name
    contentType: "SP.Data.TaskListListItem" // list item content type
});
```

### Get list item(s) `Jello.get`
##### accepts
`ID`: `optional` If item's `ID` is provided `get` will return a single list item.
##### returns
jQuery promise object.
```javascript
TaskList.get().then(function (resp) {
    console.log("List results", resp);
}, function (err) {
    console.error("Failed because", err);
});

TaskList.get(12).then(function(item){
	console.log("Item", item);
},
function (err) {
	console.log("Error fetching item", err);
});
```

### Create list item `Jello.add`
##### accepts
`item`: Object denoting list item to be added
##### returns
jQuery promise object.
```javascript
TaskList.add({
    Title: "Get eggs",
    Status: false
}).done(function (resp) {
    console.log("Added", resp);
}).fail(function (err) {
    console.log("Failed because", err);
});
```

### Update list item `Jello.update`
##### accepts
`ID`: List item ID
`item`: Object carrying properties that need to be updated along with their desired values
`etag`: `optional` Provides a way to verify that the object being changed has not been changed since it was last retrieved. If not provided, item properties will be overwritten.
##### returns
jQuery promise object.
```javascript
TaskList.update(12, {
	Title: ("Get 8 eggs"
}).then(function(){
	console.log("Successfully updated");
},
function(err) {
	console.log("Err updating", err);
});
```

### Delete list item `Jello.remove`
##### accepts
`ID`: List item ID
`etag`: `optional` Provides a way to verify that the object being changed has not been changed since it was last retrieved.
##### returns
jQuery promise object.
```javascript
TaskList.remove(12).then(function(){
	console.log("Successfully deleted");
},
function(err) {
	console.log("Err deleting", err);
});
```

###### Note
This code is available to you as is without an warranties. It can do wonders, or shatter your dreams to pieces. The developers take no liability.
