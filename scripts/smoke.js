const fs = require('fs')
const path = require('path')

async function main() {
  console.log('Running basic smoke checks...')
  const required = [
    'app/api/auth/signup/route.ts',
    'app/api/medicine/batches/route.ts',
    'app/dashboard/government-actions-client.tsx',
    'app/dashboard/manufacturer-actions-client.tsx',
    'app/dashboard/pharmacy-actions-client.tsx',
  ]

  for (const p of required) {
    const fp = path.join(process.cwd(), p)
    if (!fs.existsSync(fp)) {
      console.error('Missing file:', p)
      process.exit(2)
    }
  }

  console.log('Files exist — run `pnpm build` to verify compilation.')
}

main().catch((err) => { console.error(err); process.exit(1) })
