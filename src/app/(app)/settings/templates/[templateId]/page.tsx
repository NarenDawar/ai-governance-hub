'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// --- NEW: Question now includes a riskScore ---
interface Question {
  id: string;
  text: string;
  riskScore: number;
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

interface Questionnaire {
  title: string;
  sections: Section[];
}

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({ title: '', sections: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/assessment-templates/${templateId}`);
        if (!response.ok) throw new Error('Failed to fetch template data.');
        const data = await response.json();
        setName(data.name);
        setDescription(data.description);
        setQuestionnaire(data.questions as Questionnaire);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplate();
  }, [templateId]);

  // --- State Update Handlers ---

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, title: newTitle } : s),
    }));
  };

  const handleQuestionChange = (sectionId: string, questionId: string, field: 'text' | 'riskScore', value: string | number) => {
    setQuestionnaire(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q) }
          : s
      ),
    }));
  };

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: 'New Section',
      questions: [],
    };
    setQuestionnaire(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: 'New Question',
      riskScore: 0, // Default risk score
    };
    setQuestionnaire(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: [...s.questions, newQuestion] }
          : s
      ),
    }));
  };

  const deleteSection = (sectionId: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      ),
    }));
  };

  // --- API Call Handlers ---

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessment-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          questions: { ...questionnaire, title: name },
        }),
      });
      if (!response.ok) throw new Error('Failed to save changes.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (window.confirm('Are you sure you want to delete this template permanently?')) {
      setError(null);
      try {
        const response = await fetch(`/api/assessment-templates/${templateId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete the template.');
        router.push('/settings/templates');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while deleting.');
      }
    }
  };


  if (isLoading) return <div className="p-8 text-center">Loading template...</div>;
  if (error && !questionnaire) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/settings/templates" className="text-blue-600 hover:underline">
            &larr; Back to All Templates
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg">
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">Template Name</label>
              <input type="text" id="templateName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="templateDesc" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="templateDesc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Sections & Questions</h2>
            <div className="space-y-6">
              {questionnaire.sections.map((section) => (
                <div key={section.id} className="p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => handleSectionTitleChange(section.id, e.target.value)}
                      className="text-lg font-semibold text-gray-800 border-b-2 border-transparent focus:border-blue-500 focus:outline-none w-full"
                    />
                    <button onClick={() => deleteSection(section.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Delete Section</button>
                  </div>
                  
                  <div className="space-y-4">
                    {section.questions.map((question, qIndex) => (
                      <div key={question.id} className="flex items-center space-x-2">
                        <span className="text-gray-500">{qIndex + 1}.</span>
                        <input
                          type="text"
                          value={question.text}
                          onChange={e => handleQuestionChange(section.id, question.id, 'text', e.target.value)}
                          className="block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3"
                          placeholder="Type your question here..."
                        />
                        <input
                          type="number"
                          value={question.riskScore || 0}
                          onChange={e => handleQuestionChange(section.id, question.id, 'riskScore', parseInt(e.target.value, 10))}
                          className="w-24 border border-gray-200 rounded-md shadow-sm py-2 px-3"
                          title="Risk Score"
                        />
                        <button onClick={() => deleteQuestion(section.id, question.id)} className="text-gray-400 hover:text-red-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addQuestion(section.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Add Question</button>
                  </div>
                </div>
              ))}
              <button onClick={addSection} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md transition">+ Add Section</button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
             <button onClick={handleDeleteTemplate} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition text-sm">
              Delete Template
            </button>
             {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}