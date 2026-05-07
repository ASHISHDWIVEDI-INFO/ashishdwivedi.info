from django.core.management.base import BaseCommand
from portfolio.models import Project, ResearchPaper, BlogPost


class Command(BaseCommand):
    help = 'Seed database with sample portfolio data'

    def handle(self, *args, **options):
        # Projects
        projects = [
            dict(slug='ai-research-platform', title='AI Research Platform', description='Collaborative ML paper publishing with citation graphs and impact metrics.', long_description='Full case study coming soon.', category='ai_ml', tags=['Next.js','Python','MongoDB','OpenAI'], image_url='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800', github_url='https://github.com', live_url='https://example.com', featured=True, year=2025, order=1),
            dict(slug='saas-analytics', title='SaaS Analytics Dashboard', description='Real-time BI dashboard with charting and automated PDF reporting.', long_description='Full case study coming soon.', category='business', tags=['React','Django','PostgreSQL','Redis'], image_url='https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', github_url='https://github.com', live_url='https://example.com', featured=True, year=2025, order=2),
            dict(slug='marketplace', title='Multi-Vendor Marketplace', description='E-commerce marketplace with Stripe Connect and ML recommendations.', long_description='Full case study coming soon.', category='web', tags=['Next.js','Stripe','AWS'], image_url='https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', github_url='https://github.com', live_url='https://example.com', featured=True, year=2024, order=3),
        ]
        for p in projects:
            Project.objects.get_or_create(slug=p['slug'], defaults=p)
        self.stdout.write(self.style.SUCCESS(f'Created {len(projects)} projects'))

        # Research papers
        papers = [
            dict(slug='llm-citation-networks', title='Citation Network Analysis Using LLMs', abstract='We propose transformer-based citation graph construction achieving 94.2% precision.', venue='NeurIPS 2024', year=2024, tags=['NLP','Transformers'], co_authors=['Dr. Smith','Prof. Patel'], pdf_url='/papers/p1.pdf', arxiv_url='https://arxiv.org', citations=42),
            dict(slug='sentiment-multilingual', title='Cross-Lingual Sentiment Transfer', abstract='Semi-supervised framework for low-resource sentiment analysis.', venue='ACL 2024', year=2024, tags=['Sentiment','Multilingual'], co_authors=['Dr. Gupta'], pdf_url='/papers/p2.pdf', arxiv_url='https://arxiv.org', citations=28),
        ]
        for p in papers:
            ResearchPaper.objects.get_or_create(slug=p['slug'], defaults=p)
        self.stdout.write(self.style.SUCCESS(f'Created {len(papers)} papers'))

        # Blog posts
        posts = [
            dict(slug='ai-in-business', title='How AI is reshaping the SaaS business model', excerpt='The SaaS landscape is undergoing a fundamental transformation.', content='Full content here...', category='business', tags=['SaaS','AI'], read_time=7, published=True, featured=True),
            dict(slug='nextjs-django', title='Production Next.js + Django architecture patterns', excerpt='After shipping 10+ stacks, these patterns hold under load.', content='Full content here...', category='engineering', tags=['Next.js','Django'], read_time=12, published=True, featured=False),
        ]
        for p in posts:
            BlogPost.objects.get_or_create(slug=p['slug'], defaults=p)
        self.stdout.write(self.style.SUCCESS(f'Created {len(posts)} blog posts'))

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
