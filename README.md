## Background

This module provides a drop-in replacement for `kue` that adds
one additional method to the `Job` prototype.

I originally submitted this as [a pull
request](https://github.com/LearnBoost/kue/pull/313) to the `kue`
project.  I think the developers of `kue` felt that they would prefer
something that was more of a generalization of the currently avialable
"progress" functionality in `kue`.  I think they point was that they
weren't against the functionality itself but just wanted to have a
more graceful way of expanding the features in a way that was perhaps
more aligned with existing functionality.

In the near term, I still wanted this kind of facility in `kue` and I
think it actually opens up a wide range of additional possibilities.
To be clear, I'm not trying to create a generalized message passing
system.  I have an application where I need a job queue system but one
that simply allows more information to be passed back to the job
requester than current `kue` offers.  I recognize that someone could
go a little nuts with this functionality and it could be seen as a bit
of a pandora's box for that reason.  But I thought at a minimum I
should offer up this contribution even if it isn't suitable for
inclusion in `kue` directly.

## Example

Here is a simple use case where I send a `result` event (and
associated message) back to the job requester.  You are free, of
course, to implement other events (and listeners for them):

```
var kue = require("kue-send");
var jobs = kue.createQueue();

var result = {pt: null};
jobs.process('email', function (job, done) {
    // Before we mark this as done, send back a result
    job.send("result", {processingTime: 120});
    done();
});

var job_data = {
    title: 'Test Email Job',
    to: 'tj@learnboost.com'
}

// Create the job
var j = jobs.create('email', job_data);
// Add listeners
j.on('result', function (obj) {
    result.pt = obj.processingTime
}).save(); // Send job to be run
```

## Promises

The above example is a bit awkward because you constant have to thread
some local variable through the event handler for `result`.  However,
I use this 'send' functionality in conjunction with
[`Q`](https://github.com/kriskowal/q).  Since `kue-send` adds the
ability to return results to the existing functionality of returning
errors, it made it very easy to use the event listening mechanism to
generate promises (which I prefer working with) for any job.  As a
result, I added another extension that makes it possible (using
`kue-send`) to turn jobs into promises as follows:

```
var kue = require("kue-send");
var jobs = kue.createQueue();

jobs.process('email', function (job, done) {
    // Before we mark this as done, send back a result
    job.send("result", {processingTime: 120});
    done();
});

var job_data = {
    title: 'Test Email Job',
    to: 'tj@learnboost.com'
}

// Create a promise instead
var p = jobs.create(name, job_data).promise();
p.then(function(res) {
   console.log("Processing took: "+res.processingTime);
}, function(err) {
   console.log("Error: "+err);
}).done();
```
