# segment-webhook
GCP Cloud Function that implements Twilio Segment's webhook interface.

## Overview
The function takes calls from Twilio Segment and writes data to a Vantage instance.

## Deployment

### Prerequsites
1. A GCP account. If you don't have an account, you can create one at https://console.cloud.google.com/.
2. `gcloud` installed. See https://cloud.google.com/sdk/docs/install.
3. Vantage Express instance exposed to the Internet. For details, see [the "Run Vantage Express on GCP" guide](https://quickstarts.teradata.com/docs/17.10/vantage.express.gcp.html).

### Build and deploy

1. Create a Vantage Express instance and expose it to the Internet. For example, you could follow [the "Run Vantage Express on GCP" guide](https://quickstarts.teradata.com/docs/17.10/vantage.express.gcp.html).
2. Clone this repository:
    ```
    git clone git@github.com:Teradata/segment-webhook.git
    ```
3. Deploy the function:
    ```
    TODO: gcloud
    ```
4. Configure Teradata Vantage as a destination in Segment.


