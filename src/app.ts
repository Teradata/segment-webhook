import express from "express";
import { segmentWebhookListener, connectionClose } from "./segmentWebhookListener";

export const app = express();

app.use(express.json());
app.post('/', (req, res) => {
  return segmentWebhookListener(req, res);
});

export function close() {
  try {
    connectionClose();
  } catch(error) {
    console.warn(new Error(`Couldn't cleanup connections: ${error}`));
  }
}
