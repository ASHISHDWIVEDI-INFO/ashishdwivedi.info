'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import BlogEditorForm from '@/components/admin/BlogEditorForm';
import { blogAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EditBlogPage() {
  const { id } = useParams();
  const [post,    setPost]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await blogAPI.getBySlug(id); // works with ID too
        setPost(res.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  );

  if (!post) return (
    <div className="text-center py-20 text-purple-300/50 text-sm">Post not found.</div>
  );

  return <BlogEditorForm existingPost={post} />;
}
