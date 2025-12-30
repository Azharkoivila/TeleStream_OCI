# TeleStream OCI

> **High-performance Telegram file streaming with Oracle Cloud Object Storage integration**

TeleStream OCI is a Node.js service that bridges Telegram media with Oracle Object Storage using stream-based processing. Files are transferred in manageable chunks without requiring local disk storage or high RAM overhead.

---

## 🎯 Overview

TeleStream OCI acts as intelligent middleware between Telegram and Oracle Cloud Infrastructure, processing file transfers through a sophisticated queue system while maintaining zero local storage footprint.

### Architecture Flow

```
User → Telegram Bot → Channel/Group → Chunked Stream → Oracle Object Storage → PAR Link → User
                            ↓
                        BullMQ Queue
```

---

## ✨ Why TeleStream OCI?

| Feature | Benefit |
|---------|---------|
| 🚀 **Zero Local Storage** | Stream directly without disk writes |
| 📦 **Queue-Based Processing** | Reliable handling with automatic retries |
| 🔗 **Instant Download Links** | Auto-generated PAR URLs on completion |
| 👥 **Multi-User Support** | Concurrent processing for multiple users |
| ⚡ **Memory Efficient** | Chunked streaming keeps RAM usage low |
| 🔄 **Resumable Uploads** | Failed uploads continue where they left off |

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Redis**: v6.0+ for queue management ([Installation Guide](https://redis.io/docs/getting-started/))
- **Telegram Bot**: Created via [@BotFather](https://t.me/botfather)
- **Telegram API Credentials**: From [my.telegram.org](https://my.telegram.org)
- **Oracle Cloud Account**: Free tier available ([Sign up](https://oracle.com/cloud/free/))
- **OCI Object Storage Bucket**: Pre-configured with appropriate policies

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Azharkoivila/TeleStream_OCI.git
cd telestream-oci
npm install
```

### 2. Configure OCI Credentials

Place your OCI credential files in one of these locations:
- **Default**: `/home/username/.oci/`
- **Custom**: Modify the path in `TelegramClient/helpers/oci/client/ociClient.js`

Your OCI credentials should include:
- `config` - OCI configuration file
- `oci_api_key.pem` - Your API signing key

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Telegram Bot Configuration
# Get your bot token from @BotFather (https://t.me/botfather)
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Telegram Client API Credentials
# Obtain from https://my.telegram.org
API_ID=12345678
API_HASH=abc123def456ghi789jkl012mno345pq

# Oracle Cloud Object Storage
# Find these in your OCI console
OCI_NAMESPACE=your-tenancy-namespace
OCI_BUCKETNAME=your-bucket-name
OCI_BASE_PAR_URL=https://objectstorage.region.oraclecloud.com/p/...

# Telegram Processing Group
# The bot must be an admin in this group/channel
TG_GROUP_ID= 

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # Leave empty if no authentication

# Session Management
# Leave empty on first run - will be auto-generated
SESSION_ID=
```

### 4. Start the Application

```bash
npm start
```

On first run, you'll be prompted to authenticate your Telegram account via phone number and verification code.

### 5. Test Your Setup

1. Send any file to your bot on Telegram
2. You should receive a confirmation that the file is queued
3. Wait for processing to complete
4. Receive a direct download link (PAR URL)

---

## 📖 User Workflow

### How It Works

1. **Send File**: User sends or forwards any file to the bot
2. **Queue Confirmation**: Bot acknowledges and queues the file for processing
3. **Channel Forward**: Bot forwards file to the dedicated processing channel
4. **Streaming Upload**: File streams in chunks directly from Telegram to Oracle Cloud
5. **Link Generation**: Pre-authenticated request (PAR) URL is automatically created
6. **Delivery**: User receives the download link with expiration details

### Supported File Types

- Documents (PDF, DOCX, etc.)
- Images (JPG, PNG, etc.)
- Videos (MP4, AVI, etc.)
- Audio (MP3, WAV, etc.)
- Archives (ZIP, RAR, etc.)
- Any file type up to 2GB (Telegram's limit)

---

## 🏗️ Architecture

### System Components

**Telegram Bot Layer**
- Receives files from users
- Forwards to processing channel
- Manages user notifications
- Handles commands and status queries

**Stream Processor**
- Downloads from Telegram in chunks
- Pipes directly to Oracle Object Storage
- No intermediate storage used
- Memory-efficient chunked processing

**Queue Manager (BullMQ)**
- Prioritizes and schedules downloads
- Handles concurrency limits
- Provides automatic retry logic
- Manages job states and failures

**Oracle Cloud Integration**
- Multipart upload handling
- PAR URL generation
- Bucket management
- Credential authentication

### Data Flow Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ Send File
       ▼
┌─────────────┐      ┌──────────────┐
│ Telegram Bot│─────▶│ Process Queue│
└──────┬──────┘      │   (BullMQ)   │
       │             └──────┬───────┘
       │ Forward            │ Pop Job
       ▼                    ▼
┌─────────────┐      ┌──────────────┐
│   Channel   │◀─────│    Worker    │
└─────────────┘      └──────┬───────┘
                            │ Stream Chunks
                            ▼
                     ┌──────────────┐
                     │Oracle Object │
                     │   Storage    │
                     └──────┬───────┘
                            │ Generate PAR
                            ▼
                     ┌──────────────┐
                     │   User Gets  │
                     │  Download URL│
                     └──────────────┘
```

### Project Structure

```
telestream-oci/
├── server.js                      # Application entry point
├── package.json                   # Dependencies and scripts
├── package-lock.json
├── .env.example                   # Environment template
├── TelegramBot/
│   ├── bullmq/
│   │   └── producer.js            # Queue job creation
│   └── telegraf/
│       └── telegraf.js            # Bot interface and commands
└── TelegramClient/
    ├── tgClient.js                # Main Telegram client handler
    └── helpers/
        ├── telegram/
        │   ├── fetchMedia.js      # Media retrieval logic
        │   └── fileStream.js      # Stream processing
        └── oci/
            ├── client/
            │   └── ociClient.js   # OCI SDK initialization
            └── helper/
                ├── initMultipart.js    # Start multipart upload
                ├── commitMultipart.js  # Finalize upload
                └── generatePAR.js      # Create download URLs
```

---

## ⚙️ Configuration

### OCI Bucket Setup

Your Oracle Object Storage bucket should be configured with:

1. **Public Bucket Policy** (if using public PARs):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

2. **PAR Configuration**:
- Set appropriate expiration times (default: 7 days)
- Configure access type (read-only recommended)

### Redis Configuration

For production deployments:

```bash
# Persistent storage
appendonly yes
appendfsync everysec

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Security
requirepass your-strong-password
```

### BullMQ Options

Customize queue behavior in your code:

```javascript
const queueOptions = {
  concurrency: 3,           // Process 3 files simultaneously
  attempts: 3,              // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 2000             // Start with 2s delay
  }
};
```

---

## 📊 Performance

- **Chunk Size**: Configurable (default optimized for 5MB chunks)
- **Concurrent Downloads**: 3 simultaneous transfers (adjustable)
- **Memory Usage**: ~50-100MB per active transfer
- **Supported File Sizes**: Up to 2GB (Telegram's maximum)
- **Upload Speed**: Network-dependent, typically 10-50 MB/s
- **Queue Throughput**: Hundreds of files per hour

---

## 🔐 Security Considerations

### Essential Security Practices

1. **Credential Management**
   - Never commit `.env` to version control
   - Use environment variables or secrets manager in production
   - Rotate OCI API keys regularly
   - Use strong Redis passwords

2. **PAR URL Security**
   - Set appropriate expiration times (7 days recommended)
   - Use read-only access for generated PARs
   - Monitor PAR usage for suspicious activity
   - Revoke compromised PARs immediately

3. **Bot Security**
   - Implement rate limiting for bot interactions
   - Validate file sizes before processing
   - Sanitize user inputs
   - Monitor for abuse patterns

4. **Channel Privacy**
   - Use private Telegram channels for processing
   - Limit channel member access
   - Enable channel history privacy
   - Regularly audit channel members

5. **Network Security**
   - Use HTTPS for all connections
   - Enable Redis authentication
   - Implement firewall rules for Redis
   - Use VPC/private networks when possible
---

## 📈 Monitoring and Logging

### Queue Monitoring

Access BullMQ dashboard:
```bash
npm install -g bull-board
bull-board
```
---


### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name telestream-oci

# Enable startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "start"]
```


---

**Made with ❤️ **
