import mongoose from 'mongoose'

const FileMetadataSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  accessRights: { type: String, default: 'public' },
  dataLocation: { type: String, required: true },
  attention: { type: String, default: 'None' },
  confidence: { type: String, default: 'None' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('FileMetadata', FileMetadataSchema)