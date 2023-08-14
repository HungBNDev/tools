// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/classes/startinstancescommand.html

import https from 'https';
// ES6+ example
import { EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";


export const handler = async (event) => {
    // a client can be shared by different commands.
    const client = new EC2Client({ region: 'ap-southeast-1' });

    // Staging2, Staging 1, Demo
    const ec2InstanceIds = ['i-xxxxxxx'];

    // setup instance params
    const input = { // StopInstancesRequest
        InstanceIds: ec2InstanceIds,
    };

    const command = new StartInstancesCommand(input);
    const response = await client.send(command);

    const instanceStr = ec2InstanceIds.join(', ');
    await doPostRequest(instanceStr)
        .then(result => console.log(`Status code: ${result}`))
        .catch(err => console.error(`Error doing the request for the event: ${JSON.stringify(event)} => ${err}`));
};

const doPostRequest = (record) => {
    const data = {
        text: "I start these EC2 instances with IDs: `" + record + "` due to in working hour",
        channel: '#weployvn-services-status',
        icon_emoji: ':aws-lambda:',
        username: 'AWSLambdaBot',
    }

    return new Promise((resolve, reject) => {
        const webhookUrl = process.env.SLACK_WEBHOOK_URL;
        const options = {
            hostname: 'hooks.slack.com',
            port: 443,
            path: webhookUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        };

        //create the request object with the callback with the result
        const req = https.request(options, (res) => {
            resolve(JSON.stringify(res.statusCode));
        });

        // handle the possible errors
        req.on('error', (e) => {
            reject(e.message);
        });

        //do the request
        req.write(JSON.stringify(data));

        //finish the request
        req.end();
    });
};
