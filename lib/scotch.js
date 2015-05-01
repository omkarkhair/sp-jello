var Scotch = function (baseUrl, listOptions) {

    // Any initialization logic should go here
    if (!listOptions.name || !listOptions.contentType || !baseUrl)
    {
        throw("Invalid settings");
    }

    return {
        listName: listOptions.name,
        listContentType: listOptions.contentType,
        get: function () {
            var dfd = $.Deferred();
            $.ajax({
                type: 'GET',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                url: baseUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items"
            }).done(function (resp) {
                dfd.resolve(resp);
            }).fail(function (err) {
                dfd.reject(err);
            });

            return dfd.promise();
        },
        add: function (item) {

            item.__metadata = {
                type: this.listContentType
            };

            var dfd = $.Deferred();
            $.ajax({
                type: 'POST',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                data: item,
                url: baseUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items"
            }).done(function (resp) {
                dfd.resolve(resp);
            }).fail(function (err) {
                dfd.reject(err);
            });

            return dfd.promise();
        },
        remove: function () {
            throw ("Not implemented exception");
        },
        update: function () {
            throw ("Not implemented exception");
        }
    };
}