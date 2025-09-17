'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
}

const EmptyState = () => (
  <div className="text-center bg-white p-12 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-800">No Templates Created Yet</h3>
    <p className="mt-2 text-gray-500">
      Assessment templates are the reusable questionnaires you&apos;ll use to conduct risk assessments on your AI assets. Create your first template to get started.
    </p>
  </div>
);

export default function AssessmentTemplatesPage() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/assessment-templates');
        if (!response.ok) throw new Error('Failed to fetch templates.');
        const data: AssessmentTemplate[] = await response.json();
        setTemplates(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch('/api/assessment-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTemplateName, description: newTemplateDesc }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template.');
      }
      const newTemplate: AssessmentTemplate = await response.json();
      setTemplates(prev => [...prev, newTemplate].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTemplateName('');
      setNewTemplateDesc('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Assessment Templates</h1>
          {isLoading ? (
            <p className="p-4 text-center text-gray-500">Loading templates...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : templates.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={`/settings/templates/${template.id}`} className="text-blue-600 hover:underline">
                          {template.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        <div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Template</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  id="templateName"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., EU AI Act Compliance"
                />
              </div>
              <div>
                <label htmlFor="templateDesc" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="templateDesc"
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="A brief summary of what this template is for."
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}