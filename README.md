# AWS Lambda Application: Mailgun Event Listener 

## Run locally

With `sam local`, you can execute the lambda application locally. This means that you don't need to deploy it to AWS each time for testing, which allows for much faster development interations.

The following two variants are equivalent. Note that variant 2 (`sam local start-api`) can only be used for lambda applications that have an API Gateway as an event source. On the other hand, variant 1 (`sam local invoke`) can be used to simulate any event source.

### Variant 1: `sam local invoke`

This invokes the lambda function and passes it simulated API Gateway event data.

~~~bash
cat data/apigateway-event.json | sam local invoke MailgunWebhookFunction --env-vars data/env.json
~~~

The API Gateway event data in `data/apigateway-event.json` has been generated as follows:

~~~bash
sam local generate-event apigateway aws-proxy
~~~

And the value of the `body` key in the above JSON has been replaced by a sample Mailgun "permanent fail" event payload (see [Mailgun Event Structure](https://documentation.mailgun.com/en/latest/api-events.html#event-structure)).


### Variant 2: `sam local start-api`

This runs a simulated API Gateway locally. You can then make HTTP requests to this local API Gateway (which will trigger the lambda function).

Run local API Gateway:

~~~bash
sam local start-api --env-vars data/env.json
~~~

Make POST request to local API Gateway:

~~~bash
curl -i \
  -X POST \
  -H "Content-Type: application/json" \
  -d "@data/mailgun-permanent-fail-event.json" \
  http://127.0.0.1:3000
~~~

The `data/mailgun-permanent-fail-event.json` file contains a sample Mailgun "permanent fail" event (see [Mailgun Event Structure](https://documentation.mailgun.com/en/latest/api-events.html#event-structure)).

