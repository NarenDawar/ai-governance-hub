'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// MODIFIED: Import the 'AssessmentStatus' type as well
import { Assessment, AssessmentStatus, AssessmentStatusEnum } from '../../../../lib/types';
import { Prisma } from '@prisma/client';

// Define a more specific type for our questionnaire structure
type Questionnaire = {
  title: string;
  sections: {
    id: string;
    title: string;
    questions: {
      id: string;
      text: string;
      answer: string;
      completed: boolean;
    }[];
  }[];
}

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);


  // Fetch assessment data
  useEffect(() => {
    if (!assessmentId) return;

    const fetchAssessment = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (!response.ok) throw new Error('Failed to fetch assessment.');
        const data: Assessment = await response.json();
        setAssessment(data);
        setQuestionnaire(data.questions as Questionnaire);
        setAssetId(data.assetId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);
  
  // Function to handle changes in textarea
  const handleAnswerChange = (sectionId: string, questionId: string, answer: string) => {
    if (!questionnaire) return;

    const newQuestionnaire = { ...questionnaire };
    const section = newQuestionnaire.sections.find(s => s.id === sectionId);
    if (section) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) {
        question.answer = answer;
        question.completed = answer.trim().length > 0;
        setQuestionnaire(newQuestionnaire);
      }
    }
  };

  // Function to save progress
  const handleSaveProgress = useCallback(async () => {
    if (!questionnaire) return;
    setIsSaving(true);
    try {
        // Determine the new status
        const allQuestions = questionnaire.sections.flatMap(s => s.questions);
        const answeredQuestions = allQuestions.filter(q => q.completed);
        
        // MODIFIED: Explicitly type 'newStatus' to allow any valid assessment status
        let newStatus: AssessmentStatus = AssessmentStatusEnum.InProgress;

        if (answeredQuestions.length === allQuestions.length) {
            newStatus = AssessmentStatusEnum.Completed;
        } else if (answeredQuestions.length === 0) {
            newStatus = AssessmentStatusEnum.NotStarted;
        }

      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionnaire, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to save progress.');
      // Optionally, show a success message
    } catch (err) {
      console.error(err);
      // Optionally, show an error message
    } finally {
      setIsSaving(false);
    }
  }, [assessmentId, questionnaire]);
  
  if (isLoading) return <div className="p-8">Loading assessment...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!assessment || !questionnaire) return <div className="p-8">Assessment data could not be loaded.</div>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
           {assetId && (
             <Link href={`/assets/${assetId}`} className="text-blue-600 hover:underline">
               &larr; Back to Asset Details
             </Link>
           )}
        </div>

        <div className="bg-white shadow-md rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">{questionnaire.title}</h1>
            <p className="text-sm text-gray-500 mt-1">For asset: {assessment.assetId}</p>
          </div>
          
          <div className="p-6 space-y-8">
            {questionnaire.sections.map(section => (
              <div key={section.id}>
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">{section.title}</h2>
                <div className="space-y-6">
                  {section.questions.map(question => (
                    <div key={question.id}>
                      <label htmlFor={question.id} className="block text-sm font-medium text-gray-800">
                        {question.text}
                      </label>
                      <textarea
                        id={question.id}
                        rows={4}
                        value={question.answer}
                        onChange={(e) => handleAnswerChange(section.id, question.id, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Provide details and evidence..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

           <div className="p-6 bg-gray-50 border-t flex justify-end">
             <button
               onClick={handleSaveProgress}
               disabled={isSaving}
               className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
             >
               {isSaving ? 'Saving...' : 'Save Progress'}
             </button>
           </div>
        </div>
      </div>
    </main>
  );
}

