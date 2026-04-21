
import api from './api'

export const notificationService = {
  poll:     (params) => api.get('/notifications/poll/', { params }),
  markRead: (ids)    => api.post('/notifications/mark-read/', { ids }),
}
