import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound
sys.stdout.reconfigure(encoding='utf-8')
def get_transcript(video_id):
    try:
        ytt_api = YouTubeTranscriptApi()

        # Get all available transcripts
        transcript_list = ytt_api.list(video_id)

        # Try manually created first (original language)
        try:
            transcript = transcript_list.find_manually_created_transcript(
                [t.language_code for t in transcript_list]
            )
        except NoTranscriptFound:
            # Fallback to auto-generated transcript
            transcript = transcript_list.find_generated_transcript(
                [t.language_code for t in transcript_list]
            )

        # Fetch transcript in its original language
        fetched = transcript.fetch()
        data = fetched.to_raw_data()

        print(json.dumps({
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "transcript": data
        }, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        video_id = sys.argv[1]
        get_transcript(video_id)
    else:
        print(json.dumps({"error": "No video ID provided"}))
        sys.exit(1)