
import api from './api'

export const requestService = {
  create:         (data) => api.post('/requests/', data),
  list:           ()     => api.get('/requests/'),
  getById:        (id)   => api.get(`/requests/${id}/`),
  getPending:     (params) => api.get('/requests/pending/', { params }),
  accept:         (id)   => api.post(`/requests/${id}/accept/`),
  updateStatus:   (id, status) => api.patch(`/requests/${id}/status/`, { status }),
  rate:           (id, data)   => api.post(`/requests/${id}/rate/`, data),
}
