
import api from './api'

export const providerService = {
  getNearest:      (params) => api.get('/providers/nearest/', { params }),
  getMyProfile:    ()       => api.get('/providers/me/'),
  updateProfile:   (data)   => api.patch('/providers/me/', data),
  updateLocation:  (data)   => api.patch('/providers/location/', data),
}
