// Define your event types here for type-safe event sending
// These types help ensure you send the correct data with each event

export type Events = {
  'test/hello.world': {
    data: {
      name?: string
    }
  }
  'user/signed.up': {
    data: {
      userId: string
      email: string
      name?: string
    }
  }
  'video/generate': {
    data: {
      url: string
      userId: string
      type?: 'video' | 'playlist'
    }
  }
}
