import axios from 'axios';

// ========================
// Axios Base Instance
// ========================
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================
// Request Interceptor — Attach JWT Token
// ========================
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================
// Response Interceptor — Handle 401 (auto logout)
// ========================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        const pathname = window.location.pathname;
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ========================
// Multipart form (file uploads)
// ========================
const uploadAPI = (url, formData, onProgress) =>
  API.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress(pct);
      }
    },
  });

// ========================
// Auth
// ========================
export const authAPI = {
  login:          (data) => API.post('/auth/login', data),
  logout:         ()     => API.post('/auth/logout'),
  changePassword: (data) => API.put('/auth/change-password', data),
  refresh:        ()     => API.post('/auth/refresh'),
};

// ========================
// Profile
// ========================
export const profileAPI = {
  get:           ()       => API.get('/profile'),
  update:        (data)   => API.put('/profile', data),
  uploadPhoto:   (fd, cb) => uploadAPI('/profile/photo', fd, cb),
  uploadResume:  (fd, cb) => uploadAPI('/profile/resume', fd, cb),
};

// ========================
// Projects
// ========================
export const projectsAPI = {
  getAll:   (params) => API.get('/projects', { params }),
  getById:  (id)     => API.get(`/projects/${id}`),
  create:   (data)   => API.post('/projects', data),
  update:   (id, d)  => API.put(`/projects/${id}`, d),
  delete:   (id)     => API.delete(`/projects/${id}`),
  upload:   (id, fd) => uploadAPI(`/projects/${id}/image`, fd),
};

// ========================
// Skills
// ========================
export const skillsAPI = {
  getAll:   (params) => API.get('/skills', { params }),
  create:   (data)   => API.post('/skills', data),
  update:   (id, d)  => API.put(`/skills/${id}`, d),
  delete:   (id)     => API.delete(`/skills/${id}`),
};

// ========================
// Experience
// ========================
export const experienceAPI = {
  getAll:   () => API.get('/experience'),
  create:   (data)   => API.post('/experience', data),
  update:   (id, d)  => API.put(`/experience/${id}`, d),
  delete:   (id)     => API.delete(`/experience/${id}`),
};

// ========================
// Education
// ========================
export const educationAPI = {
  getAll:   () => API.get('/education'),
  create:   (data)   => API.post('/education', data),
  update:   (id, d)  => API.put(`/education/${id}`, d),
  delete:   (id)     => API.delete(`/education/${id}`),
};

// ========================
// Startup
// ========================
export const startupAPI = {
  getAll:   () => API.get('/startup'),
  create:   (data)   => API.post('/startup', data),
  update:   (id, d)  => API.put(`/startup/${id}`, d),
  delete:   (id)     => API.delete(`/startup/${id}`),
};

// ========================
// Blog
// ========================
export const blogAPI = {
  getAll:   (params) => API.get('/blog', { params }),
  getBySlug: (slug)  => API.get(`/blog/${slug}`),
  create:   (data)   => API.post('/blog', data),
  update:   (id, d)  => API.put(`/blog/${id}`, d),
  publish:  (id)     => API.patch(`/blog/${id}/publish`),
  delete:   (id)     => API.delete(`/blog/${id}`),
};

// ========================
// Certifications
// ========================
export const certificationsAPI = {
  getAll:   () => API.get('/certifications'),
  create:   (data)   => API.post('/certifications', data),
  update:   (id, d)  => API.put(`/certifications/${id}`, d),
  delete:   (id)     => API.delete(`/certifications/${id}`),
};

// ========================
// Achievements
// ========================
export const achievementsAPI = {
  getAll:   () => API.get('/achievements'),
  create:   (data)   => API.post('/achievements', data),
  update:   (id, d)  => API.put(`/achievements/${id}`, d),
  delete:   (id)     => API.delete(`/achievements/${id}`),
};

// ========================
// Testimonials
// ========================
export const testimonialsAPI = {
  getAll:   () => API.get('/testimonials'),
  create:   (data)   => API.post('/testimonials', data),
  update:   (id, d)  => API.put(`/testimonials/${id}`, d),
  delete:   (id)     => API.delete(`/testimonials/${id}`),
};

// ========================
// Media & Press
// ========================
export const mediaPressAPI = {
  getAll:   () => API.get('/media-press'),
  create:   (data)   => API.post('/media-press', data),
  update:   (id, d)  => API.put(`/media-press/${id}`, d),
  delete:   (id)     => API.delete(`/media-press/${id}`),
};

// ========================
// Contact
// ========================
export const contactAPI = {
  submit:   (data) => API.post('/contact', data),
  getAll:   ()     => API.get('/contact'),
  markRead: (id)   => API.patch(`/contact/${id}/read`),
  delete:   (id)   => API.delete(`/contact/${id}`),
};

// ========================
// Resume
// ========================
export const resumeAPI = {
  upload:       (fd, cb) => uploadAPI('/resume', fd, cb),
  getInfo:      ()       => API.get('/resume'),
  trackDownload: ()      => API.post('/resume/download'),
};

// ========================
// Media Library (GridFS)
// ========================
export const mediaAPI = {
  getAll:   () => API.get('/media'),
  upload:   (fd, cb) => uploadAPI('/media/upload', fd, cb),
  delete:   (id)     => API.delete(`/media/${id}`),
  getUrl:   (id)     => `${process.env.NEXT_PUBLIC_API_URL}/media/${id}`,
};

// ========================
// Settings
// ========================
export const settingsAPI = {
  get:    () => API.get('/settings'),
  update: (data) => API.put('/settings', data),
};

export default API;