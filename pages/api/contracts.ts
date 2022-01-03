// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
type Data = {
  knownAddress: string[];
}

const ABI_PATH = './public/abis';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const knownAddress = fs.readdirSync(ABI_PATH)
    .filter((x) => x.startsWith('0x'))
    .map((x) => x.replace('.json', ''));
  res.status(200).json({ knownAddress });
}
