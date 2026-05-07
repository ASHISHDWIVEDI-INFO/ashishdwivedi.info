from django.contrib import admin
from .models import Project, ResearchPaper, BlogPost, ContactMessage


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'year', 'featured', 'created_at')
    list_filter = ('category', 'featured', 'year')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('featured',)
    ordering = ('-year', '-featured')


@admin.register(ResearchPaper)
class ResearchPaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'venue', 'year', 'citations')
    list_filter = ('venue', 'year')
    search_fields = ('title', 'abstract')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-year', '-citations')


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'published', 'featured', 'read_time', 'created_at')
    list_filter = ('category', 'published', 'featured')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('published', 'featured')
    ordering = ('-created_at',)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'read', 'created_at')
    list_filter = ('read',)
    list_editable = ('read',)
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
    ordering = ('-created_at',)
