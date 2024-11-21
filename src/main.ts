import type { Request, Response } from 'express'
import type { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { consola } from 'consola'
import express from 'express'

const app = express()
app.use(express.json())

app.post('/cameras/capture', async (req: Request, res: Response) => {
  const { rtspURL } = req.body

  if (!rtspURL) {
    return res.status(400).json({ error: 'RTSP URL is required' })
  }

  const outputPath = join(tmpdir(), `${randomUUID()}.jpg`)

  try {
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-rtsp_transport',
        'tcp',
        '-i',
        rtspURL,
        '-frames:v',
        '1',
        '-q:v',
        '2',
        outputPath,
      ])

      let errorOutput = ''
      ffmpeg.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString()
      })

      ffmpeg.on('close', (code: number) => {
        if (code === 0)
          resolve(null)
        else
          reject(new Error(`FFmpeg failed with code ${code}: ${errorOutput}`))
      })

      ffmpeg.on('error', reject)
    })

    if (!fs.existsSync(outputPath)) {
      throw new Error('Output file not found')
    }

    res.sendFile(outputPath, (err) => {
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr)
          consola.error('Error deleting temporary file:', unlinkErr)
      })

      if (err)
        consola.error('Error sending file:', err)
    })
  }
  catch (error) {
    fs.unlink(outputPath, (unlinkErr) => {
      if (unlinkErr)
        consola.error('Error deleting temporary file:', unlinkErr)
    })

    consola.error('Error capturing snapshot:', error)
    res.status(500).json({ error: 'Failed to capture snapshot' })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  consola.success(`Server is running on port ${PORT}`)
})
