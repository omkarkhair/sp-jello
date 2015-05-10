var Scotch = function (siteUrl, listOptions) {

    // Any initialization logic should go here
    if (!listOptions.name || !listOptions.contentType || !siteUrl)
    {
        throw("Invalid settings");
    }
    
    
    return {
        listName: listOptions.name,
        listContentType: listOptions.contentType,
        requestDigest: null,
        getRequestDigest: function () {
            var dfd = $.Deferred();
            if (this.requestDigest && this.requestDigest.expiresOn < (new Date())) {
                $.ajax({
                    type: "POST",
                    url: "https://jello.sharepoint.com/sites/sprest/_api/contextinfo",
                    headers: {
                    "accept": "application/json;odata=verbose"
                    }
                }).done(function(resp){
                    var now = (new Date()).getTime();
                    this.requestDigest = resp.d;
                    this.requestDigest.expiresOn = now + (resp.d.FormDigestTimeoutSeconds * 1000) - 60000; // -60000 To prevent any calls to fail at all, by refreshing a minute before
                    dfd.resolve();
                })
                .fail(function(err){
                    console.log("Error fetching Request Digest. Some parts won't work.");
                    dfd.reject();
                });
            }
            else {
                return dfd.resolve();
            }
            
            return dfd.promise();
        },
        get: function () {
            var dfd = $.Deferred();
            $.ajax({
                type: 'GET',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                url: siteUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items"
            }).done(function (resp) {
                dfd.resolve(resp);
            }).fail(function (err) {
                dfd.reject(err);
            });

            return dfd.promise();
        },
        add: function (item) {
            
            var dfd = $.Deferred();
            
            this.getRequestDigest().then(function(){
                item.__metadata = {
                    type: this.listContentType
                };
                
                $.ajax({
                    type: 'POST',
                    headers: {
                        "accept": "application/json;odata=verbose"
                    },
                    data: item,
                    url: siteUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items"
                }).done(function (resp) {
                    dfd.resolve(resp);
                }).fail(function (err) {
                    dfd.reject(err);
                });
            }, function (err) {
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