var Jello = function (siteUrl, listOptions) {

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
            var self = this;
            var dfd = $.Deferred();
            if (self.requestDigest && self.requestDigest.expiresOn > (new Date())) {
                return dfd.resolve();
            }
            else {
                $.ajax({
                    type: "POST",
                    url: "https://jello.sharepoint.com/sites/sprest/_api/contextinfo",
                    headers: {
                    "accept": "application/json;odata=verbose"
                    }
                }).done(function(resp){
                    var now = (new Date()).getTime();
                    self.requestDigest = resp.d.GetContextWebInformation;
                    self.requestDigest.expiresOn = now + (resp.d.GetContextWebInformation.FormDigestTimeoutSeconds * 1000) - 60000; // -60000 To prevent any calls to fail at all, by refreshing a minute before
                    console.log("Token", self.requestDigest.FormDigestValue);
                    dfd.resolve();
                })
                .fail(function(err){
                    console.log("Error fetching Request Digest. Some parts won't work.");
                    dfd.reject();
                });
            }
            
            return dfd.promise();
        },
        get: function (top) {
            var dfd = $.Deferred();
            
            var filter = ( top ) ? "?$top=" + top : "" ;
            
            $.ajax({
                type: 'GET',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                url: siteUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items" + filter
            }).done(function (resp) {
                dfd.resolve(resp);
            }).fail(function (err) {
                dfd.reject(err);
            });

            return dfd.promise();
        },
        getById: function (id) {
            var dfd = $.Deferred();
            
            if (!id)
                throw("Provided ID is not valid");
            
            $.ajax({
                type: 'GET',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                url: siteUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items(" + id + ")"
            }).done(function (resp) {
                dfd.resolve(resp);
            }).fail(function (err) {
                dfd.reject(err);
            });

            return dfd.promise();
        },
        add: function (item) {
            var self = this;
            var dfd = $.Deferred();
            
            this.getRequestDigest().then(function(){
                item.__metadata = {
                    type: self.listContentType
                };
                
                var payload = JSON.stringify(item);
                $.ajax({
                    type: 'POST',
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": self.requestDigest.FormDigestValue
                    },
                    data: payload,
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
        remove: function (id, etag) {
            // if etag not provided, overwrite item even if outdated
            if (!etag)
                etag = "*";
            
            var self = this;
            var dfd = $.Deferred();
            
            this.getRequestDigest().then(function(){
                
                $.ajax({
                    type: 'POST',
                    headers: {
                        "X-RequestDigest": self.requestDigest.FormDigestValue,
                        "X-HTTP-Method": "DELETE",
                        "If-Match": etag
                    },
                    url: siteUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items(" + id + ")"
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
        update: function (id, update, etag) {
            
            // if etag not provided, overwrite item even if outdated
            if (!etag)
                etag = "*";
            
            var self = this;
            var dfd = $.Deferred();
            
            this.getRequestDigest().then(function(){
                update.__metadata = {
                    type: self.listContentType
                };
                
                var payload = JSON.stringify(update);
                $.ajax({
                    type: 'POST',
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": self.requestDigest.FormDigestValue,
                        "X-HTTP-Method": "MERGE",
                        "If-Match": etag
                    },
                    data: payload,
                    url: siteUrl + "/_api/web/lists/getbytitle('" + listOptions.name + "')/items(" + id + ")"
                }).done(function (resp) {
                    dfd.resolve(resp);
                }).fail(function (err) {
                    dfd.reject(err);
                });
            }, function (err) {
                dfd.reject(err);
            });
            
            return dfd.promise();
        }
    };
}