import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const transcribeClient = new TranscribeClient({ region: 'ap-south-1' });
const s3Client = new S3Client({ region: 'ap-south-1' });

const AUDIO_BUCKET = process.env.AUDIO_BUCKET || 'yojanamitra-audio';
const JOB_PREFIX = 'transcribe-jobs';

interface TranscribeRequest {
  audioData: string; // Base64 encoded audio blob
  mediaFormat: 'mp3' | 'wav' | 'webm' | 'ogg'; // Common browser formats
  languageCode?: string;
}

/**
 * Converts base64 audio data to Buffer and uploads to S3
 */
async function uploadAudioToS3(audioBase64: string, fileName: string): Promise<string> {
  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    const s3Key = `${JOB_PREFIX}/${Date.now()}-${fileName}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: AUDIO_BUCKET,
        Key: s3Key,
        Body: audioBuffer,
        ContentType: 'audio/wav'
      })
    );

    return `s3://${AUDIO_BUCKET}/${s3Key}`;
  } catch (error) {
    console.error('Error uploading audio to S3:', error);
    throw new Error('Failed to upload audio file');
  }
}

/**
 * Starts a transcription job with AWS Transcribe
 */
async function startTranscriptionJob(
  s3AudioUri: string,
  languageCode: string = 'en-IN' // India English by default
): Promise<string> {
  try {
    const jobName = `transcribe-${Date.now()}`;
    
    const response = await transcribeClient.send(
      new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        Media: {
          MediaFileUri: s3AudioUri
        },
        MediaFormat: 'wav',
        LanguageCode: languageCode,
        OutputBucketName: AUDIO_BUCKET,
        OutputKey: `${JOB_PREFIX}/${jobName}-output.json`,
        
        // Enable language identification for multi-lingual support
        IdentifyLanguage: false,
        
        // Enable speaker identification for future multi-speaker support
        ShowSpeakerLabel: false
      })
    );

    return response.TranscriptionJob?.TranscriptionJobName || jobName;
  } catch (error) {
    console.error('Error starting transcription job:', error);
    throw new Error('Failed to start transcription job');
  }
}

/**
 * Polls transcription job status (for async processing)
 */
async function getTranscriptionJobStatus(jobName: string): Promise<any> {
  try {
    const response = await transcribeClient.send(
      new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName
      })
    );

    return {
      status: response.TranscriptionJob?.TranscriptionJobStatus,
      transcript: response.TranscriptionJob?.Transcript,
      jobName: jobName
    };
  } catch (error) {
    console.error('Error getting transcription job status:', error);
    throw new Error('Failed to get transcription job status');
  }
}

/**
 * Handler function for API Gateway / Lambda invocation
 * Supports both sync (small files) and async (larger files) transcription
 */
export async function handler(event: any) {
  try {
    const { audioData, mediaFormat = 'wav', languageCode = 'en-IN' } = JSON.parse(
      event.body || '{}'
    ) as TranscribeRequest;

    if (!audioData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing audioData in request body' })
      };
    }

    // Step 1: Upload audio to S3
    const fileName = `audio-${Date.now()}.${mediaFormat}`;
    const s3Uri = await uploadAudioToS3(audioData, fileName);

    // Step 2: Start transcription job
    const jobName = await startTranscriptionJob(s3Uri, languageCode);

    // Step 3: For async processing, return job ID; client can poll for results
    // For production, use EventBridge or SNS to notify when complete
    return {
      statusCode: 202, // Accepted - async processing
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        jobName,
        jobStatus: 'QUEUED',
        message: 'Transcription job queued. Use jobName to check status.',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in transcribe-handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Transcription failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

/**
 * Handler for polling transcription job status
 */
export async function statusHandler(event: any) {
  try {
    const { jobName } = JSON.parse(event.body || '{}');

    if (!jobName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing jobName in request body' })
      };
    }

    const jobStatus = await getTranscriptionJobStatus(jobName);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        ...jobStatus,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in transcribe-status handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to get job status',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
