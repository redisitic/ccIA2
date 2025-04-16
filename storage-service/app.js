import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { create } from 'ipfs-http-client'
import axios from 'axios'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000
const IPFS_ENABLED = false
const METADATA_SERVICE_URL = process.env.METADATA_SERVICE_URL || 'http://localhost:4000/metadata'

const LOCAL_UPLOAD_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR)
}

let ipfs
if (IPFS_ENABLED) {
  ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' })
}

const ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012')
function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()])
  return { iv, encryptedData }
}

const upload = multer({ storage: multer.memoryStorage() })

app.post('/store', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const { iv, encryptedData } = encryptBuffer(req.file.buffer)

    if (IPFS_ENABLED && ipfs) {
      const { cid } = await ipfs.add(encryptedData)
      const { cid: ivCid } = await ipfs.add(iv)
      const fileId = cid.toString()
      const dataLocation = fileId

      // Notify Metadata Service
      await axios.post(METADATA_SERVICE_URL, {
        fileId,
        dataLocation,
        accessRights: 'public',
        attention: 'Always',
        confidence: 'Usually'
      })

      return res.json({
        success: true,
        message: 'File stored on IPFS',
        dataCid: fileId,
        ivCid: ivCid.toString()
      })
    } else {
      const fileId = req.file.originalname
      const encryptedPath = path.join(LOCAL_UPLOAD_DIR, fileId + '.enc')
      const ivPath = path.join(LOCAL_UPLOAD_DIR, fileId + '.iv')
      fs.writeFileSync(encryptedPath, encryptedData)
      fs.writeFileSync(ivPath, iv)

      // Notify Metadata Service
      await axios.post(METADATA_SERVICE_URL, {
        fileId,
        dataLocation: encryptedPath,
        accessRights: 'private',
        attention: 'Always',
        confidence: 'Usually'
      })

      return res.json({
        success: true,
        message: 'File encrypted & stored locally',
        encryptedFile: fileId + '.enc',
        ivFile: fileId + '.iv'
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Storage service listening on http://localhost:${PORT}`)
})