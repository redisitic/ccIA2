import express from 'express'
import connectDB from './db.js'
import FileMetadata from './models/FileMetadata.js'

const app = express()
app.use(express.json())

connectDB()

app.post('/metadata', async (req, res) => {
  try {
    const { fileId, accessRights, dataLocation, attention, confidence } = req.body
    const updated = await FileMetadata.findOneAndUpdate(
      { fileId },
      { accessRights, dataLocation, attention, confidence },
      { upsert: true, new: true }
    )
    return res.status(200).json(updated)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})


app.get('/metadata/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const metadata = await FileMetadata.findOne({ fileId })
    if (!metadata) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(metadata)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})


app.delete('/metadata/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const deleted = await FileMetadata.findOneAndDelete({ fileId })
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(deleted)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.listen(4000, () => {
  console.log(`Metadata server running on http://localhost:4000`)
})