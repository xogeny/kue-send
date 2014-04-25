var kue = require('../');
var Q = require('Q');

var assert = require('assert');
var jobs = kue.createQueue();

describe("Kue (with send)", function() {
    it('should work just like kue', function(done) {
	jobs.process('email', function(job, done) {
	    done();
	});
	var j = jobs.create('email', {});
	j.on('complete', function() {
	    done();
	});
	j.save();
    });

    it('should handle custom events 2', function (done) {
	var name = 'email-with-custom-event2';
	//var name = 'email-foo-bar';
	jobs.process(name, function(job, done) {
            done();
	});
	var job_data = {
            title: 'Test Email Job',
            to: 'tj@learnboost.com'
	}
	var j = jobs.create(name, job_data);
	j.on('complete', function() {
	    done();
	}).save();
    });

    it('should handle custom events', function (done) {
	var name = 'email-with-custom-event3'; // Remove the '3' and this fails!
	var jobdata = {pt: null};
	jobs.process(name, function (job, done) {
            job.send("result", {processingTime: 120})
            done();
	});
	var job_data = {
            title: 'Test Email Job',
            to: 'tj@learnboost.com'
	}
	var j = jobs.create(name, job_data);
	j.on('result', function (obj) {
	    jobdata.pt = obj.processingTime
	}).on('complete', function() {
	    assert.equal(jobdata.pt, 120);
	    done();
	}).save();
    });

    it('should be possible to turn a job into a promise', function (done) {
	var name = 'email-with-promise';
	var jobdata = {pt: null};
	jobs.process(name, function (job, done) {
            job.send("result", {processingTime: 120})
            done();
	});
	var job_data = {
            title: 'Test Email Job',
            to: 'tj@learnboost.com'
	}

	// Create a promise instead
	var p = jobs.create(name, job_data).promise();
	p.then(function(res) {
	    assert.equal(res.processingTime, 120);
	    done();
	}).done();
    });

    it('should be handle errors in jobs when using promises', function (done) {
	var name = 'email-with-promise-error';
	var jobdata = {pt: null};
	jobs.process(name, function (job, done) {
            done("Something bad happened");
	});

	var job_data = {
            title: 'Test Email Job',
            to: 'tj@learnboost.com'
	}

	// Create a promise instead
	var p = jobs.create(name, job_data).promise();
	p.then(function(v) {
	    assert.ok(false);
	    done();
	}, function(err) {
	    assert.equal(err, "Something bad happened");
	    done();
	}).done();
    });
});
