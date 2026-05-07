from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('slug', models.SlugField(unique=True)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('long_description', models.TextField(blank=True)),
                ('category', models.CharField(choices=[('web','Web'),('ai_ml','AI/ML'),('research','Research'),('open_source','Open Source'),('business','Business')], max_length=50)),
                ('tags', models.JSONField(default=list)),
                ('image', models.ImageField(blank=True, null=True, upload_to='projects/')),
                ('image_url', models.URLField(blank=True)),
                ('github_url', models.URLField(blank=True)),
                ('live_url', models.URLField(blank=True)),
                ('featured', models.BooleanField(default=False)),
                ('year', models.IntegerField()),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['-featured', '-year', 'order']},
        ),
        migrations.CreateModel(
            name='ResearchPaper',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('slug', models.SlugField(unique=True)),
                ('title', models.CharField(max_length=300)),
                ('abstract', models.TextField()),
                ('venue', models.CharField(max_length=100)),
                ('year', models.IntegerField()),
                ('tags', models.JSONField(default=list)),
                ('co_authors', models.JSONField(default=list)),
                ('pdf_url', models.URLField(blank=True)),
                ('arxiv_url', models.URLField(blank=True)),
                ('citations', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['-year', '-citations']},
        ),
        migrations.CreateModel(
            name='BlogPost',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('slug', models.SlugField(unique=True)),
                ('title', models.CharField(max_length=300)),
                ('excerpt', models.TextField()),
                ('content', models.TextField()),
                ('category', models.CharField(choices=[('business','Business'),('engineering','Engineering'),('research','Research'),('personal','Personal')], max_length=50)),
                ('tags', models.JSONField(default=list)),
                ('published', models.BooleanField(default=False)),
                ('featured', models.BooleanField(default=False)),
                ('read_time', models.IntegerField(default=5)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='ContactMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField()),
                ('subject', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
