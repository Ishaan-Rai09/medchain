const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

async function main() {
  const uri = process.env.DATABASE_URL
  if (!uri) {
    console.error('Set DATABASE_URL in .env')
    process.exit(2)
  }

  const [,, target] = process.argv
  if (!target) {
    console.error('Usage: node scripts/db-activate-user.js <email-or-id>')
    process.exit(2)
  }

  const client = new MongoClient(uri)
  await client.connect()
  const dbName = (process.env.MONGODB_DB_NAME) || (new URL(uri.split('?')[0]).pathname.replace('/', ''))
  const db = client.db(dbName)
  const users = db.collection('users')

  const filter = target.match(/^[0-9a-fA-F]{24}$/) ? { _id: new ObjectId(target) } : { email: target }
  const update = { $set: { status: 'ACTIVE', updatedAt: new Date() } }
  const res = await users.updateOne(filter, update)
  console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount)
  await client.close()
}

main().catch(err => { console.error(err); process.exit(1) })
