from django.db import models


class Project(models.Model):
    CATEGORY_CHOICES = [
        ('web', 'Web'),
        ('ai_ml', 'AI/ML'),
        ('research', 'Research'),
        ('open_source', 'Open Source'),
        ('business', 'Business'),
    ]

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    long_description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    tags = models.JSONField(default=list)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    image_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)
    year = models.IntegerField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-featured', '-year', 'order']

    def __str__(self):
        return self.title


class ResearchPaper(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=300)
    abstract = models.TextField()
    venue = models.CharField(max_length=100)
    year = models.IntegerField()
    tags = models.JSONField(default=list)
    co_authors = models.JSONField(default=list)
    pdf_url = models.URLField(blank=True)
    arxiv_url = models.URLField(blank=True)
    citations = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-citations']

    def __str__(self):
        return self.title


class BlogPost(models.Model):
    CATEGORY_CHOICES = [
        ('business', 'Business'),
        ('engineering', 'Engineering'),
        ('research', 'Research'),
        ('personal', 'Personal'),
    ]

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=300)
    excerpt = models.TextField()
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    tags = models.JSONField(default=list)
    published = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    read_time = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.subject}'
