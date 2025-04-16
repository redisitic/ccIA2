import mongoose from 'mongoose'

const FileMetadataSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  dataLocation: { type: String, required: true },
  accessRights: { type: String, default: 'private' },
  attention: { type: String, default: '' },
  confidence: { type: String, default: '' },
  label: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('FileMetadata', FileMetadataSchema)