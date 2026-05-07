from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Project, ResearchPaper, BlogPost, ContactMessage
from .serializers import (
    ProjectSerializer, ResearchPaperSerializer,
    BlogPostListSerializer, BlogPostDetailSerializer,
    ContactMessageSerializer,
)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filterset_fields = ['category', 'featured']
    lookup_field = 'slug'


class ResearchPaperViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ResearchPaper.objects.all()
    serializer_class = ResearchPaperSerializer
    lookup_field = 'slug'


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPost.objects.filter(published=True)
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


@api_view(['POST'])
def contact_view(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        msg = serializer.save()

        try:
            send_mail(
                subject=f'Portfolio contact: {msg.subject}',
                message=f'From: {msg.name} <{msg.email}>\n\n{msg.message}',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[settings.CONTACT_RECIPIENT],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({'status': 'sent'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
