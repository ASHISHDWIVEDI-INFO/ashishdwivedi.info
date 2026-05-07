from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ResearchPaperViewSet, BlogPostViewSet, contact_view

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'research', ResearchPaperViewSet, basename='research')
router.register(r'blog', BlogPostViewSet, basename='blog')

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', contact_view, name='contact'),
]
