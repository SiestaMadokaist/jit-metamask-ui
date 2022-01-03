// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as fs from 'fs';
import { spawn } from 'child_process';
import type { NextApiRequest, NextApiResponse } from 'next'
type Data = { OK: 200 }

const ABI_PATH = './public/abis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await new Promise((rs, rj) => {
    const rm = spawn('rm', ['-rf', ABI_PATH]);
    rm.on('close', rs);
  }).catch((error) => {});
  fs.mkdirSync(ABI_PATH);
  res.status(200).json({ OK: 200 });
}
