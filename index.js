var kue = require('kue');
var events = require('kue/lib/queue/events');
var Job = require('kue/lib/queue/job');
var Q = require("Q");

Job.prototype.send = function (event, data) {
    events.emit(this.id, event, data);
}

Job.prototype.promise = function (event, data) {
    var d = Q.defer();

    this.on("result", function(res) {
	d.resolve(res); // A result resolves the promise
    })
    .on("complete", function() {
        // On completion, make sure it was already resolved
	if (d.promise.isPending()) {
	    d.reject("Job did not return a result before completing");
	}
    })
    .on("error", function(err) {
	d.reject(err);
    })
    .on("failed", function() {
	if (!d.promise.isRejected()) {
	    d.reject("Job failed, but no error message given");
	}
    })
    .save();

    return d.promise;
}

module.exports = kue;
