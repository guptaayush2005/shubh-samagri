import handle from '../server.mjs';

export default async function handler(req, res) {
  if (req.headers['x-matched-path']) {
    req.url = req.headers['x-matched-path'];
  }
  return handle(req, res);
}
