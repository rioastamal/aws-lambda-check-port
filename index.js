'use strict';

/**
 * Function to check whether port on particular host is open or closed.
 * This function which will be called by AWS Lambda. The module name doesn't
 * have to be named 'lambdaHandler', because it based on configuration on
 * AWS Lambda Console.
 *
 * This script quite useful when used to test connection between Lambda
 * function and service inside Amazon VPC.
 *
 * @author Rio Astamal <me@rioastamal.net>
 * @see http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @see http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback
 *
 * @param object event  - AWS Lambda uses this parameter to pass in event
 *                        data to the handler.
 * @param object context - AWS Lambda uses this parameter to provide your
 *                         handler the runtime information of the Lambda
 *                         function that is executing. For more information,
 *                         @see The Context Object (Node.js).
 * @param callback callback - optional callback to return information to the
 *                            caller, otherwise return value is null.
 * @return void
 */
var lambdaHandler = function(event, context, callback) {
    const connData = {
        port: event.context['my-port'],
        host: event.context['my-host'],
        timeout: event.context['my-timeout']
    };

    // Set the default timeout to 50ms
    const timeout = typeof connData.timeout !== 'undefined' ?
                    parseInt(connData.timeout) :
                    50; // Fallback to 50ms
    const net = require('net');
    var message = 'Whoops port ' + connData.port + ' on host `' +
                  connData.host + '` seems closed!';

    const client = net.connect(connData, function() {
      message = 'Port ' + connData.port + ' on ' + connData.host + ' is open!';

      // Return some values to the caller
      callback(null, message);

      // We don't need it anymore
      client.destroy();
    });

    // We may have host that having firewall using 'REJECT' rules
    // instead of 'DROP' packet. Amazon Security Group mostly uses the first.
    // So we need to set the timeout - if not our function will be terminated
    // by the AWS Lambda.
    // @see http://serverfault.com/questions/521359/why-do-some-connections-time-out-and-others-get-refused
    //
    // We set the timeout for 50ms (enough right?)
    client.setTimeout(timeout, function() {
        // Close it manually
        client.destroy(new Error(message), null);
    });

    client.on('error', function(err) {
        // Return error to the caller
        callback(new Error(message), null);
    });
};

// Export the module so it can be accessed by AWS Lambda service
exports.checkPortOpen = lambdaHandler;

// Invoke the script directly
if (require.main === module) {
    var lambdaContext = {
        context: {
            'my-host': process.env.MY_HOST,
            'my-port': process.env.MY_PORT,
            'my-timeout': process.env.MY_TIMEOUT
        }
    };

    lambdaHandler(lambdaContext, null, function(err, data) {
        if (err) {
            console.log(err.message);
            return null;
        }

        console.log(data);
    });
}