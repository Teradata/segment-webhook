import { app, appClose } from './app';

const NODE_ENV = process.env.NODE_ENV || 'test';

const port = process.env.PORT || 8080;

if (['dev', 'production'].includes(NODE_ENV)) {
  app.listen(port, () => {
    console.log(`segment-webhook: listening on port ${port}`);
  });
}

process.on('SIGTERM', function () {
  console.log('segment-webhook: received SIGTERM, exiting gracefully');
  appClose();
  process.exit(0);
});
