import React from 'react'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function Landing() {
  const [file, setFile] = useState(null)
  const [attention, setAttention] = useState('')
  const [confidence, setConfidence] = useState('')
  const [label, setLabel] = useState('')
  const [fileId, setFileId] = useState('')
  const [uploadResponse, setUploadResponse] = useState(null)
  const [retrieveResponse, setRetrieveResponse] = useState(null)
  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('attention', attention)
    formData.append('confidence', confidence)
    formData.append('label', label)

    try {
      const res = await fetch('http://localhost:3000/store', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setUploadResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error(err)
      setUploadResponse(`Error: ${err.message}`)
    }
  }
  async function handleRetrieve(e) {
    e.preventDefault()
    if (!fileId) return
    try {
      const res = await fetch(`http://localhost:3000/retrieve/${fileId}`)
      if (!res.ok) {
        const errorData = await res.json()
        setRetrieveResponse(JSON.stringify(errorData, null, 2))
        return
      }
      const blob = await res.blob()
      setRetrieveResponse(`File retrieved: ${blob.size} bytes.`)
    } catch (err) {
      console.error(err)
      setRetrieveResponse(`Error: ${err.message}`)
    }
  }

  return (
    <>
    <div className="p-6 space-y-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold">Blockchain-Based Decentralized Storage Design for Data Confidence Over Cloud-Native Edge Infrastructure</h1>

      <form onSubmit={handleUpload} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            placeholder="delivery_address"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="attention">Attention</Label>
          <Input
            id="attention"
            placeholder="Always / Usually / Sometimes"
            value={attention}
            onChange={(e) => setAttention(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="confidence">Confidence</Label>
          <Input
            id="confidence"
            placeholder="Always / Usually / Sometimes"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
          />
        </div>

        <Button type="submit">Upload</Button>
      </form>

      {uploadResponse && (
        <pre className="p-2 bg-gray-100 border rounded">{uploadResponse}</pre>
      )}

      <hr />

      <form onSubmit={handleRetrieve} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="fileId">Retrieve by fileId</Label>
          <Input
            id="fileId"
            placeholder="e.g. test.pdf"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
          />
        </div>

        <Button type="submit">Retrieve</Button>
      </form>

      {retrieveResponse && (
        <pre className="p-2 bg-gray-100 border rounded">{retrieveResponse}</pre>
      )}
    </div>
    </>
  )
}

export default Landing