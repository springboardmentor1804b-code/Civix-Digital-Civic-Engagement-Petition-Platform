# AdminLogs System Documentation

## Overview
The AdminLogs system tracks all administrative actions performed on petitions and polls, creating an audit trail that connects petition creators with official actions taken on their submissions.

## Database Schema

### AdminLog Model
```
- id: ObjectId (Primary Key, Auto-generated)
- action: String (Required) - Description of the action taken
- user_id: ObjectId (Foreign Key → User._id) - The petition/poll creator
- relatedPetition: ObjectId (Foreign Key → Petition._id) - Related petition
- relatedPoll: ObjectId (Foreign Key → Poll._id) - Related poll
- metadata: Object - Additional data about the action
- createdAt: DateTime (Auto-generated) - Timestamp of the action
- updatedAt: DateTime (Auto-generated) - Last update timestamp
```

### Relationships
```
AdminLog.user_id ← → User._id (Petition/Poll creator)
AdminLog.relatedPetition ← → Petition._id
AdminLog.relatedPoll ← → Poll._id
```

## API Endpoints

### Public/Basic Auth Routes

#### Get Recent Actions
```
GET /api/admin-logs/recent?limit=10
```
Returns recent admin actions for display on dashboard.

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "...",
      "action": "Updated petition status to 'under_review'",
      "user_id": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "citizen"
      },
      "relatedPetition": {
        "_id": "...",
        "title": "Fix Streetlights on Park Ave",
        "status": "under_review"
      },
      "metadata": {
        "petitionTitle": "Fix Streetlights on Park Ave",
        "previousStatus": "active",
        "newStatus": "under_review",
        "officialId": "..."
      },
      "createdAt": "2025-10-21T10:30:00Z"
    }
  ]
}
```

### Protected Routes (Require Authentication)

#### Get All Logs
```
GET /api/admin-logs?page=1&limit=20&user_id=...&relatedPetition=...
```
Get all admin logs with filters and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `user_id` - Filter by user (petition creator)
- `relatedPetition` - Filter by petition ID
- `relatedPoll` - Filter by poll ID
- `startDate` - Filter from date
- `endDate` - Filter to date

#### Get Logs by User
```
GET /api/admin-logs/user/:userId?page=1&limit=20
```
Get all logs for a specific user (petition creator).

#### Get Logs by Petition
```
GET /api/admin-logs/petition/:petitionId
```
Get all admin actions related to a specific petition.

#### Get Logs by Poll
```
GET /api/admin-logs/poll/:pollId
```
Get all admin actions related to a specific poll.

### Official/Admin Only Routes

#### Create Admin Log
```
POST /api/admin-logs
Authorization: Bearer <token>
Role: public-official

Body:
{
  "action": "Approved petition",
  "user_id": "userId",
  "relatedPetition": "petitionId",
  "metadata": {
    "additionalInfo": "..."
  }
}
```

#### Delete Old Logs (Cleanup)
```
DELETE /api/admin-logs/cleanup
Authorization: Bearer <token>
Role: public-official

Body:
{
  "daysOld": 365
}
```
Deletes logs older than specified days (default: 365).

## Automatic Logging

The system automatically logs actions in the following scenarios:

### Petition Actions
1. **Status Update** - When an official changes petition status
   - Action: "Updated petition status to '{status}'"
   - Logs: user_id (creator), petition_id, old/new status

2. **Verification** - When an official verifies/unverifies a petition
   - Action: "Verified petition" or "Unverified petition"
   - Logs: user_id (creator), petition_id, verification note

3. **Official Response** - When an official adds a response
   - Action: "Added official response to petition"
   - Logs: user_id (creator), petition_id, response message

### Poll Actions (To be implemented)
- Poll status changes
- Official responses to polls
- Poll verification

## Usage Examples

### In Controllers

```javascript
import { logAdminAction } from './adminLogController.js';

// Example: Logging a petition status update
await logAdminAction(
  `Updated petition status to "${newStatus}"`,
  petition.creator, // user_id (creator)
  petition._id,     // relatedPetition
  null,             // relatedPoll (if applicable)
  {                 // metadata
    petitionTitle: petition.title,
    previousStatus: oldStatus,
    newStatus: newStatus,
    officialId: req.user.id,
    officialResponse: responseMessage
  }
);
```

### Querying Logs

```javascript
// Get recent actions for dashboard
const recentLogs = await AdminLog.find()
  .populate('user_id', 'name email role')
  .populate('relatedPetition', 'title status')
  .sort({ createdAt: -1 })
  .limit(10);

// Get all actions for a specific petition creator
const userLogs = await AdminLog.find({ user_id: userId })
  .populate('relatedPetition')
  .sort({ createdAt: -1 });

// Get petition history
const petitionLogs = await AdminLog.find({ relatedPetition: petitionId })
  .populate('user_id', 'name email')
  .sort({ createdAt: -1 });
```

## Frontend Integration

### Display Recent Actions

```javascript
import axios from 'axios';

// Fetch recent actions
const fetchRecentActions = async () => {
  try {
    const response = await axios.get('/api/admin-logs/recent?limit=10');
    return response.data.logs;
  } catch (error) {
    console.error('Error fetching recent actions:', error);
  }
};

// Use in component
const RecentActions = () => {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchRecentActions().then(setActions);
  }, []);

  return (
    <div>
      {actions.map(log => (
        <div key={log._id}>
          <p>{log.action}</p>
          <p>By: {log.user_id.name}</p>
          <p>Time: {new Date(log.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### Display User's Activity Log

```javascript
// Fetch user's petition activity
const fetchUserActivity = async (userId) => {
  try {
    const response = await axios.get(`/api/admin-logs/user/${userId}`);
    return response.data.logs;
  } catch (error) {
    console.error('Error fetching user activity:', error);
  }
};
```

## Benefits

1. **Audit Trail**: Complete history of all admin actions
2. **Transparency**: Users can see what actions were taken on their petitions
3. **Accountability**: Track which officials performed which actions
4. **Analytics**: Analyze admin activity patterns
5. **Compliance**: Meet regulatory requirements for record-keeping

## Security Considerations

1. **Access Control**: Only officials can create logs manually
2. **User Privacy**: Sensitive user data is not stored in logs
3. **Data Retention**: Old logs can be cleaned up automatically
4. **Authorization**: All endpoints require proper authentication/authorization

## Maintenance

### Database Indexes
The following indexes are created for optimal performance:
- `user_id + createdAt` (descending)
- `relatedPetition`
- `relatedPoll`

### Cleanup Script
Run periodically to remove old logs:
```javascript
// Delete logs older than 1 year
await AdminLog.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
});
```

## Future Enhancements

1. Email notifications to users when actions are logged
2. Real-time updates via WebSocket
3. Advanced filtering and search
4. Export logs to CSV/PDF
5. Dashboard analytics and visualizations
6. Integration with Poll actions
7. Notification system based on admin logs
