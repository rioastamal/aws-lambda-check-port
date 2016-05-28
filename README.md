## Overview

A simple NodeJS script to check whether port on particular host is open
or closed. This script designed in mind to work on AWS Lambda Service.
So the arguments follow the requirements used by AWS Lambda.

This script only uses node core libraries so it has zero dependencies
and could be run directly on AWS Lambda by just copy-paste to the
online editor.

## Run the Script

### Via Command Line

The script can be run locally using node command line. If the script
invoked directly you need to pass the argument using environment
variables.

Below are some examples how to run the script from command line.

```
$ export MY_HOST=localhost; export MY_PORT=80; export MY_TIMEOUT=50
$ node index.js
Port 80 on localhost is open!
```

Let's change the port number.

```
$ export MY_PORT=1919
$ node index.js
Whoops port 1919 on host `localhost` seems closed!
```

### Via AWS Lambda

Assuming all your AWS Lambda permissions setting is correct, you only need to
change few settings. Here are the settings that I use:

* **Runtime**: Node.js 4.3
* **Handler**: index.checkPortOpen
* **Role**: Basic execution role

Emulate the input of the script by specify on the "Input test event" by clicking
Actions > Configure test event. Below is example of the test data.

```
{
    "context": {
        "my-host": "172.31.0.10",
        "my-port": 3307,
        "my-timeout": 75
    }
}
```

Change `my-host` and `my-port` to anything else, could be any address on the internet
or host inside your VPC (but make sure firewall and settings are correct).

Try to run the test to see the output.

## License

This script is open source licensed under [MIT license](http://opensource.org/licenses/MIT).