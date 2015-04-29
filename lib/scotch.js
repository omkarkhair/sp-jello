var Scotch = function (baseUrl, listOptions) {

    // Any initialization logic should go here
    if (!listOptions.name || !listOptions.contentType || !baseUrl)
    {
        throw("Invalid settings");
    }

    return {
        listName: options.name,
        listContentType: options.contentType,
        get: function () {
            $.get({
                accept: "application/json;odata=verbose",
                url: baseUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items"
            });
        },
        add: function (item) {
            throw ("Not implemented exception");
        },
        remove: function () {
            throw ("Not implemented exception");
        },
        update: function () {
            throw ("Not implemented exception");
        }
    };
}