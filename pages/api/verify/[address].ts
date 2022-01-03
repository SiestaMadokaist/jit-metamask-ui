// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
type Data = {
  name: string
}

const ABI_PATH = './public/abis';

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '10mb' // Set desired value here
      }
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { address } = req.query;
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
  fs.writeFileSync(`${ABI_PATH}/${address}.json`, body);
  res.status(200).json({ name: 'John Doe' })
}
