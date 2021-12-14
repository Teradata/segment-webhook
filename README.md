# segment-webhook
GCP Cloud Run project that implements Twilio Segment's webhook interface.

## Overview
The app takes calls from Twilio Segment and writes data to a Vantage instance.

## Deployment

### Prerequsites
1. A GCP account. If you don't have an account, you can create one at https://console.cloud.google.com/.
2. `gcloud` installed. See https://cloud.google.com/sdk/docs/install.
3. `Cloud Run` and dependent services enabled (`gcloud services enable cloudbuild.googleapis.com containerregistry.googleapis.com run.googleapis.com secretmanager.googleapis.com`).
4. Vantage Express instance exposed to the Internet. For details, see [the "Run Vantage Express on GCP" guide](https://quickstarts.teradata.com/docs/17.10/vantage.express.gcp.html).

### Build and deploy

1. Create a Vantage Express instance and expose it to the Internet. For example, see [Run Vantage Express on GCP](https://quickstarts.teradata.com/docs/17.10/vantage.express.gcp.html).
1. Clone this repository:
    ```
    git clone git@github.com:Teradata/segment-webhook.git
    ```
1. Build the application (replace `<PROJECT_ID>` with your GCP project id):
    ```
    gcloud builds submit --tag gcr.io/<PROJECT_ID>/webhook-segment
    ```
1. Define an API key that you will share with Segment. Store the API key in GCP Secret Manager:
    ```
    gcloud secrets create API_KEY_SECRET
    cat << EOF > /tmp/api_key.txt
    a_very_long_and_secure_api_key_that_you_should_change
    EOF
    gcloud secrets versions add API_KEY_SECRET --data-file=/tmp/api_key.txt

    gcloud secrets create VANTAGE_USER_SECRET
    cat << EOF > /tmp/vantage_user.txt
    dbc
    EOF
    gcloud secrets versions add VANTAGE_USER_SECRET --data-file=/tmp/vantage_user.txt

    gcloud secrets create VANTAGE_PASSWORD_SECRET
    cat << EOF > /tmp/vantage_password.txt
    dbc
    EOF
    gcloud secrets versions add VANTAGE_PASSWORD_SECRET --data-file=/tmp/vantage_password.txt
    ```
1. Deploy the app to cloud run (replace `<PROJECT_ID>` with your GCP project id and `<VANTAGE_HOST>` with your Vantage host name or IP address):
    ```
    gcloud run deploy --image gcr.io/<PROJECT_ID>/webhook-segment webhook-segment \
      --region us-central1 \
      --allow-unauthenticated \
      --update-env-vars VANTAGE_HOST=<VANTAGE_HOST> \
      --set-secrets 'API_KEY=<API_KEY_SECRET:VERSION>,VANTAGE_USER=<VANTAGE_USER_SECRET:VERSION>, VANTAGE_PASSWORD=<VANTAGE_PASSWORD_SECRET:VERSION>'

    ```
1. Configure Teradata Vantage as a destination in Segment.

## Limitations

* Inbound security relies on sharing an API key between Segment and the Cloud Run app. Ideally, your Cloud Run service would be behind a WAF like Cloud Run, to allow connectivity only from Segment's IP addresses.
* The example shows how to deploy the app in a single region. In many cases, this setup doesn't guarantee enough uptime. The app should be deployed in more than one region behind a Global Load Balancer.
* There are no CI/CD examples using GitHub Actions.
