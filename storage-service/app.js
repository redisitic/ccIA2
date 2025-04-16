import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { create } from 'ipfs-http-client'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { storeOnChain } from './blockchain.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

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
function decryptBuffer(encryptedBuffer, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()])
}
function levelPriority(level) {
  switch (level) {
    case 'Always': return 3
    case 'Usually': return 2
    case 'Sometimes': return 1
    default: return 0
  }
}

const upload = multer({ storage: multer.memoryStorage() })

app.post('/store', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const { attention, confidence, label, accessRights } = req.body
    const { iv, encryptedData } = encryptBuffer(req.file.buffer)
    const fileId = req.file.originalname

    if (IPFS_ENABLED && ipfs) {
      const { cid } = await ipfs.add(encryptedData)
      const { cid: ivCid } = await ipfs.add(iv)
      const dataLocation = cid.toString()
      await axios.post(METADATA_SERVICE_URL, {
        fileId,
        dataLocation,
        accessRights: accessRights || 'public',
        attention: attention || 'Always',
        confidence: confidence || 'Usually',
        label: label || ''
      })
      await storeOnChain(fileId, 'v1.0', dataLocation)

      return res.json({
        success: true,
        message: 'File stored on IPFS + chain + metadata DB',
        dataCid: dataLocation,
        ivCid: ivCid.toString()
      })
    } else {
      const encryptedPath = path.join(LOCAL_UPLOAD_DIR, fileId + '.enc')
      const ivPath = path.join(LOCAL_UPLOAD_DIR, fileId + '.iv')
      fs.writeFileSync(encryptedPath, encryptedData)
      fs.writeFileSync(ivPath, iv)
      await axios.post(METADATA_SERVICE_URL, {
        fileId,
        dataLocation: encryptedPath,
        accessRights: accessRights || 'private',
        attention: attention || 'Always',
        confidence: confidence || 'Usually',
        label: label || ''
      })
      await storeOnChain(fileId, 'v1.0', encryptedPath)

      return res.json({
        success: true,
        message: 'File encrypted & stored locally + chain + metadata DB',
        encryptedFile: fileId + '.enc',
        ivFile: fileId + '.iv'
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/retrieve/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const { data: metadata } = await axios.get(`${METADATA_SERVICE_URL}/${fileId}`)
    if (!metadata) {
      return res.status(404).json({ error: 'Metadata not found' })
    }

    const { dataLocation, attention, confidence } = metadata
    if (levelPriority(attention) < levelPriority(confidence)) {
      return res.status(403).json({ error: 'Retrieval not allowed' })
    }

    if (IPFS_ENABLED && ipfs) {
      const encryptedDataChunks = []
      for await (const chunk of ipfs.cat(dataLocation)) {
        encryptedDataChunks.push(chunk)
      }
      return res.status(501).json({ error: 'IPFS retrieval with IV not fully implemented' })
    } else {
      const encPath = dataLocation
      const ivPath = encPath.replace('.enc', '.iv')
      if (!fs.existsSync(encPath) || !fs.existsSync(ivPath)) {
        return res.status(404).json({ error: 'Encrypted file or IV not found' })
      }
      const encryptedFile = fs.readFileSync(encPath)
      const iv = fs.readFileSync(ivPath)
      const decryptedData = decryptBuffer(encryptedFile, iv)
      res.setHeader('Content-Disposition', 'attachment; filename="output"')
      return res.send(decryptedData)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Storage service listening on http://localhost:${PORT}`)
})
