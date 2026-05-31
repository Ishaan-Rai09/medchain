const { MongoClient } = require('mongodb')
require('dotenv').config()

async function main() {
  const uri = process.env.DATABASE_URL
  if (!uri) {
    console.error('Set DATABASE_URL in .env')
    process.exit(2)
  }

  const client = new MongoClient(uri)
  await client.connect()
  const dbName = (process.env.MONGODB_DB_NAME) || (new URL(uri.split('?')[0]).pathname.replace('/', ''))
  const db = client.db(dbName)
  const users = await db.collection('users').find({}, { projection: { passwordHash: 0 } }).toArray()
  console.log('Users:')
  users.forEach(u => console.log(JSON.stringify(u, null, 2)))
  await client.close()
}

main().catch(err => { console.error(err); process.exit(1) })
