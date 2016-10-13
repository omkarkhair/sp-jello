var Jello = function(siteUrl) {
	var self = this;
    this.siteUrl = siteUrl;
    this.requestDigest = null;

 	//private
    var GetRequestDigest = function () {
        var dfd = $.Deferred();
        if (self.requestDigest && self.requestDigest.expiresOn > (new Date())) {
            return dfd.resolve();
        }
        else {
            $.ajax({
                type: "POST",
                url: siteUrl + "/_api/contextinfo",
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
    };
	this.Web = function(){
		//do stuff with web
		throw("Not implemented");
	};

	this.List = function(){
		//do stuff with web
		throw("Not implemented");
	};

    //do stuff with list items
    this.ListItems = function(options) {
        var list = options.name;
        var filterObj = {
			filter: null,
			expand: null,
    	    select: null,
			orderBy: null
		};
        var contentType = options.contentType;

        var get = function(top) {
            var dfd = $.Deferred();
            var filter = "";

            // If filter is set, execute
            if (filterObj.select || filterObj.filter || filterObj.expand || filterObj.orderBy) {
                if (filterObj.expand)
                    filter = (filter.length > 0) ? filter + "&" + filterObj.expand : filter + "?" + filterObj.expand;

                if (filterObj.select)
                    filter = (filter.length > 0) ? filter + "&" + filterObj.select : filter + "?" + filterObj.select;

                if (filterObj.filter)
                    filter = (filter.length > 0) ? filter + "&" + filterObj.filter : filter + "?" + filterObj.filter;

                if (filterObj.orderBy)
                    filter = (filter.length > 0) ? filter + "&" + filterObj.orderBy : filter + "?" + filterObj.orderBy;

                if (top)
                    filter = (filter.length > 0) ? filter + "&$top=" + top : filter + "?$top=" + top;

                // Reset the filter
                filterObj = {
                    filter: null,
                    expand: null,
                    select: null,
                    orderBy: null
                };
            } else {
                filter = (top) ? "?$top=" + top : "";
            }

            url = siteUrl + "/_api/web/lists/getbytitle('" + list + "')/items" + filter;
            $.ajax({
                type: 'GET',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                url: url
            }).done(function(resp) {
                // Add paging methods
                resp.next = function() {
                    var dfd_next = $.Deferred();
                    get(null, resp.d.__next).then(function(next_res) {
                        dfd_next.resolve(next_res);
                    }, function(err) {
                        dfd_next.reject(err);
                    });
                    return dfd_next.promise();
                };

                resp.prev = function() {
                    var dfd_prev = $.Deferred();
                    get(null, resp.d.__prev).then(function(prev_res) {
                        dfd_prev.resolve(prev_res);
                    }, function(err) {
                        dfd_prev.reject(err);
                    });
                    return dfd_prev.promise();
                };
                dfd.resolve(resp);
            }).fail(function(err) {
                dfd.reject(err);
            });

            return dfd.promise();
        };
        var getById = function(id) {
            var dfd = $.Deferred();

            if (!id)
                throw ("Provided ID is not valid");

            $.ajax({
                type: 'GET',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                url: siteUrl + "/_api/web/lists/getbytitle('" + list + "')/items(" + id + ")"
            }).done(function(resp) {
                dfd.resolve(resp);
            }).fail(function(err) {
                dfd.reject(err);
            });

            return dfd.promise();
        };
        var add = function(item) {
            var dfd = $.Deferred();
            GetRequestDigest().then(function() {
                item.__metadata = {
                    type: contentType
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
                    url: siteUrl + "/_api/web/lists/getbytitle('" + list + "')/items"
                }).done(function(resp) {
                    dfd.resolve(resp);
                }).fail(function(err) {
                    dfd.reject(err);
                });
            }, function(err) {
                dfd.reject(err);
            });

            return dfd.promise();
        };
        var remove = function(id, etag) {
            // if etag not provided, overwrite item even if outdated
            if (!etag)
                etag = "*";
            var dfd = $.Deferred();

            GetRequestDigest().then(function() {

                $.ajax({
                    type: 'POST',
                    headers: {
                        "X-RequestDigest": self.requestDigest.FormDigestValue,
                        "X-HTTP-Method": "DELETE",
                        "If-Match": etag
                    },
                    url: siteUrl + "/_api/web/lists/getbytitle('" + list + "')/items(" + id + ")"
                }).done(function(resp) {
                    dfd.resolve(resp);
                }).fail(function(err) {
                    dfd.reject(err);
                });
            }, function(err) {
                dfd.reject(err);
            });

            return dfd.promise();
        };
        var update = function(id, update, etag) {

            // if etag not provided, overwrite item even if outdated
            if (!etag)
                etag = "*";

            var dfd = $.Deferred();

			GetRequestDigest().then(function() {
                update.__metadata = {
                    type: contentType
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
                    url: siteUrl + "/_api/web/lists/getbytitle('" + list + "')/items(" + id + ")"
                }).done(function(resp) {
                    dfd.resolve(resp);
                }).fail(function(err) {
                    dfd.reject(err);
                });
            }, function(err) {
                dfd.reject(err);
            });

            return dfd.promise();
        };
        var query = function(filter) {
            var dfd = $.Deferred();
            filter = (filter) ? "?" + filter : "";
            $.ajax({
                type: 'GET',
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                url: siteUrl + "/_api/web/lists/getbytitle('" + list + "')/items" + filter
            }).done(function(resp) {
                dfd.resolve(resp);
            }).fail(function(err) {
                dfd.reject(err);
            });
            return dfd.promise();
        };

        var where = function(filter) {
            filterObj.filter = "$filter=" + filter;
            return this;
        };
        var expand = function(filter) {
            filterObj.expand = "$expand=" + filter;
			return this;
        };
        var select = function(filter) {
            filterObj.select = "$select=" + filter;
            return this;
        };
        var orderBy = function(filter) {
            filterObj.orderBy = "$orderby=" + filter;
			return this;
        };

        return {
            get: get,
            getById: getById,
            add: add,
            remove: remove,
            update: update,
            query: query,
            where: where,
            expand: expand,
            select: select,
            orderBy: orderBy
        };
    };
};
module.exports = Jello
