import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function CareerPath({ student }) {
    const [careerPaths, setCareerPaths] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateCareerPaths = async () => {
        setLoading(true);
        setError(null);
        setCareerPaths(null);

        const subjects = student.enrolledSubjects.map(sub => ({
            name: sub.name,
            grade: sub.grade,
            credits: sub.credits
        }));

        const prompt = `
            Based on the following student academic data, suggest a few potential career paths.
            For each career path, provide a brief description and explain why it's a good fit based on the student's subjects and grades.
            
            Student Name: ${student.profile.name}
            Department: ${student.department}
            Enrolled Subjects: ${JSON.stringify(subjects)}

            Format the response as a JSON array of objects. Each object should have a "title", "description", and a "justification".
            Example:
            [
                {"title": "Software Engineer", "description": "Builds and maintains software applications.", "justification": "The student has strong grades in subjects like Data Structures and Web Application Development."},
                {"title": "Data Scientist", "description": "Analyzes large datasets to extract insights.", "justification": "High performance in Probability, Statistics, and Python Programming points to a strong analytical foundation."}
            ]
            Ensure the output is valid JSON and nothing else.
        `;

        try {
            const chatHistory = [{
                role: "user",
                parts: [{ text: prompt }]
            }];
            const payload = {
                contents: chatHistory,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                "title": { "type": "STRING" },
                                "description": { "type": "STRING" },
                                "justification": { "type": "STRING" }
                            },
                            "propertyOrdering": ["title", "description", "justification"]
                        }
                    }
                }
            };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            const paths = textResponse ? JSON.parse(textResponse) : [];
            setCareerPaths(paths);
        } catch (e) {
            setError("Failed to generate career paths. Please try again later.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <Link to="/" className="back-link">← Back to Dashboard</Link>
                <h2>Career Path Suggestions</h2>
            </div>

            <div className="card text-center">
                <p className="text-gray-600">Get personalized career suggestions based on your academic performance.</p>
                <button
                    onClick={generateCareerPaths}
                    disabled={loading}
                    className={`mt-4 py-2 px-4 rounded-md text-white font-medium transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {loading ? 'Generating...' : 'Generate Career Paths'}
                </button>
            </div>
            
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {careerPaths && careerPaths.length > 0 && (
                <div className="mt-6 space-y-4">
                    {careerPaths.map((path, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800">{path.title}</h3>
                            <p className="mt-2 text-gray-600">{path.description}</p>
                            <p className="mt-4 text-sm font-medium text-blue-600">Why it's a good fit:</p>
                            <p className="text-sm text-gray-700">{path.justification}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CareerPath;