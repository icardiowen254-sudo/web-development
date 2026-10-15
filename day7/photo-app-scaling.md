# SnapShare: Photo-App Scaling Plan

## 1. Assumptions

- SnapShare has **10,000,000 registered users**.
- **10% of registered users are active daily**.
- Each daily active user uploads **1 original photo per day** and views **50 feed pages per day**.
- Each original photo averages **2 MB** and each photo produces one **50 KB thumbnail**.
- Calculations use a 365-day year and decimal storage units (1 TB = 1,000 GB). They estimate averages across a full day; real traffic will be uneven.
- Peak traffic is estimated at **5 times the average**.
- The feed-view estimate counts feed-page requests, not the number of individual photos or image files displayed on each page.
- Storage estimates include one original and one thumbnail for every upload, but exclude replicas, backups, temporary files, metadata, and future video support.

## 2. Traffic and storage estimates

### Daily active users

10,000,000 registered users × 10% active per day = **1,000,000 daily active users (DAU)**.

### Uploads per second

- Uploads per day: 1,000,000 DAU × 1 photo = **1,000,000 photos/day**.
- Average uploads per second: 1,000,000 ÷ 86,400 = **about 11.6 uploads/second**.
- Estimated peak uploads per second: 11.6 × 5 = **about 57.9 uploads/second**.

### Feed views per second

- Feed views per day: 1,000,000 DAU × 50 pages = **50,000,000 feed pages/day**.
- Average feed views per second: 50,000,000 ÷ 86,400 = **about 579 feed views/second**.
- Estimated peak feed views per second: 579 × 5 = **about 2,894 feed views/second**.

These are feed-page requests only. Each page can cause additional requests for thumbnails, so actual image-delivery traffic can be much higher.

### Photo storage per year

**Original photos**
- Daily: 1,000,000 × 2 MB = **2,000,000 MB/day**, or about 2 TB/day.
- Yearly: 2,000,000 MB × 365 = **730,000,000 MB/year**, or about **730 TB/year**.

**Thumbnails**
- Daily: 1,000,000 × 50 KB = **50,000,000 KB/day**, or about 50 GB/day.
- Yearly: 50,000,000 KB × 365 = **18,250,000,000 KB/year**, or about **18.25 TB/year**.

**Combined raw media storage:** 730 TB + 18.25 TB = **about 748.25 TB per year**. This is before replicas, backups, and storage overhead.

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy**. Each daily active user generates 50 feed-page views but only one photo upload per day, giving approximately 50 feed reads for every upload. The design should therefore scale feed reads and image delivery independently: use a CDN for cached images, a cache for frequently requested feed data, and database read replicas for read queries. Uploads still need reliable handling, but they are less frequent than reads under these assumptions.

## 4. Where photo files should be stored

Original photos and thumbnails should live in **object storage**, while the database stores metadata such as the photo ID, owner, object-storage key, caption, upload time, and visibility. Putting large binary photo files directly in the relational database would make the database much larger, increase backup and replication costs, and make database capacity harder to manage. Object storage is designed for durable, large-scale file storage, while the database can focus on relationships, permissions, and feed metadata.

## 5. Architecture diagram

```text
                         +----------------------+
                         |      Mobile/Web      |
                         |        Clients       |
                         +----------+-----------+
                                    |
                     +--------------+---------------+
                     |                              |
             Feed/API requests               Photo/image requests
                     |                              |
             +-------v--------+              +------v------+
             | Load Balancer  |              |     CDN     |
             +-------+--------+              +------+------+
                     |                              |
             +-------v--------+                     |
             |  App Servers   |<--------------------+
             | (stateless API)|     cache misses / object fetches
             +---+---------+--+
                 |         |
        +--------v--+   +--v----------------+
        | Feed Cache|   | Primary Database  |
        | (e.g.     |   | users, follows,    |
        | Redis)    |   | photo metadata     |
        +-----------+   +---------+----------+
                                  |
                           replication
                                  |
                        +---------v----------+
                        | Database Read      |
                        | Replica(s)         |
                        +--------------------+

 Photo upload path:
 +----------------+   +----------------+   +------------------+
 | Client uploads |-->| App Server     |-->| Object Storage   |
 | photo          |   | validates/auth |   | original photo   |
 +----------------+   +-------+--------+   +--------+---------+
                               |                     |
                               | save metadata       | object-created event
                               v                     v
                       +---------------+      +-------------+
                       | Primary DB    |      | Job Queue   |
                       | photo record  |      +------+------+
                       +---------------+             |
                                               +-----v------+
                                               | Thumbnail  |
                                               | Worker     |
                                               +-----+------+
                                                     |
                                             create thumbnail
                                                     |
                                             +-------v--------+
                                             | Object Storage |
                                             | thumbnail      |
                                             +----------------+
```

## 6. What each component solves

- **Clients:** Let users upload photos and request their personalized feeds from phones or browsers.
- **CDN:** Serves cached thumbnails and other image files from locations near users, reducing latency and origin-server bandwidth.
- **Load balancer:** Distributes incoming API requests across healthy app servers so one server does not become a bottleneck.
- **App servers:** Run stateless application logic such as authentication, authorization, feed assembly, upload validation, and metadata updates.
- **Feed cache:** Keeps frequently requested feed results or supporting data in fast memory to reduce repeated database queries.
- **Primary database:** Reliably stores structured records and relationships such as users, follows, photo metadata, and permissions.
- **Database read replica:** Handles suitable read queries to reduce load on the primary database; replication may lag slightly behind writes.
- **Object storage:** Durably stores original photos and generated thumbnails without filling the database with large binary files.
- **Job queue:** Buffers thumbnail-generation jobs so upload requests do not have to wait for image processing and jobs can be retried.
- **Thumbnail worker:** Consumes queued jobs, resizes uploaded originals, creates thumbnails, and stores them in object storage.

## 7. Photo-upload flow

1. The user selects a photo in the client and sends it over HTTPS with their authentication credentials.
2. An app server authenticates the user, checks upload permissions and file limits, and validates that the upload is an allowed image type.
3. The original photo is written to object storage under a unique object key. In a larger implementation, the app could issue a short-lived pre-signed upload URL so the client uploads directly to object storage, reducing app-server bandwidth.
4. The app server records the photo's owner, object key, caption, upload time, and processing status in the primary database.
5. A thumbnail-generation job is placed on the queue, containing the photo ID and object key. If the object-storage event is used to enqueue work, the event should be handled idempotently to avoid duplicate processing.
6. A thumbnail worker takes the job, retrieves the original from object storage, resizes and compresses it, and writes the thumbnail back to object storage using a separate key.
7. The worker marks the photo's thumbnail status as ready in the database. Failed jobs can be retried, and repeated jobs should not create inconsistent duplicate records.
8. The client can show the uploaded photo once the original is saved and display the thumbnail when it is ready. The CDN serves cached copies of the thumbnail to feed viewers.

## 8. Trade-offs

1. **Caching versus freshness:** A feed cache reduces database load and improves response time, but cached feeds can be stale after someone uploads a photo or changes who they follow. Use short TTLs or targeted cache invalidation, accepting some extra complexity.
2. **Read replicas versus consistency:** Read replicas let the system serve more feed queries, but replication lag means a newly uploaded photo may not immediately appear in every read. Read recent-write-sensitive requests from the primary or use a consistency-aware strategy.
3. **Asynchronous thumbnails versus immediate availability:** A queue keeps uploads fast and absorbs bursts, but thumbnails are not instantly available and workers introduce operational complexity. Show a processing placeholder and retry failed jobs.
4. **CDN caching versus privacy and invalidation:** CDN caching reduces latency and bandwidth, but private photos need access controls and careful cache configuration; removing or changing a photo may require invalidating cached content.
5. **Object storage versus database simplicity:** Object storage scales well for media, but the application must manage object keys, permissions, orphaned files, and consistency between database records and stored objects.

## Conclusion

The main scaling priority is serving the high volume of feed reads and image requests efficiently. A CDN, cache, read replicas, object storage, and asynchronous thumbnail workers keep those workloads separate, while the primary database remains responsible for reliable structured data.
