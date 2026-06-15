'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProjectForm from '@/components/admin/ProjectForm';
import { projectsAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EditProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await projectsAPI.getById(id);
        setProject(res.data.data);
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

  if (!project) return (
    <div className="text-center py-20 text-purple-300/50">Project not found.</div>
  );

  return <ProjectForm existingProject={project} />;
}

