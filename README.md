# segment-webhook
GCP Cloud Run project that implements Twilio Segment's webhook interface.

## Overview
The app takes calls from Twilio Segment and writes data to a Vantage instance.

## Deployment

### Prerequsites
1. A GCP account. If you don't have an account, you can create one at https://console.cloud.google.com/.
2. `gcloud` installed. See https://cloud.google.com/sdk/docs/install.
3. `Cloud Run` enabled (`gcloud services enable cloudbuild.googleapis.com containerregistry.googleapis.com run.googleapis.com`).
4. Vantage Express instance exposed to the Internet. For details, see [the "Run Vantage Express on GCP" guide](https://quickstarts.teradata.com/docs/17.10/vantage.express.gcp.html).

### Build and deploy

1. Create a Vantage Express instance and expose it to the Internet. For example, see [Run Vantage Express on GCP](https://quickstarts.teradata.com/docs/17.10/vantage.express.gcp.html).
2. Clone this repository:
    ```
    git clone git@github.com:Teradata/segment-webhook.git
    ```
3. Build the application:
    ```
    gcloud builds submit --tag gcr.io/<PROJECT_ID>/webhook-segment
    ```
3. Deploy the app to cloud run (replace `<PROJECT_ID>` with your GCP project id and `<VANTAGE_HOST>` with your Vantage host name or IP address):
    ```
    gcloud run deploy --image gcr.io/<PROJECT_ID>/webhook-segment webhook-segment --region us-central1 --allow-unauthenticated --update-env-vars VANTAGE_HOST=<VANTAGE_HOST>
    ```
4. Configure Teradata Vantage as a destination in Segment.

## Limitations

1. There is no cleanup of Teradata connections on shutdown. As the app gets restarted, connections leak. Once the limit of connections is reached, no client app will be able to connect to Vantage.
2. The app relies on secrets that are currently passed as env variables. Secrets should be retrieved from Secret Manager instead.
3. Inbound security relies on sharing an API key between Segment and the Cloud Run app. Ideally, your Cloud Run service would be behind a WAF like Cloud Run, to allow connectivity only from Segment's IP addresses.
4. The example shows how to deploy the app in a single region. In many cases, this setup doesn't guarantee enough uptime. The app should be deployed in more than one region behind a Global Load Balancer.
