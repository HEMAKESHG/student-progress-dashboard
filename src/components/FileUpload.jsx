// src/components/FileUpload.jsx
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { departmentRules } from '../data/mockData';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import CategorizeSubjectsModal from './CategorizeSubjectsModal.jsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

function namesMatch(name1, name2) {
    if (!name1 || !name2) return false;
    const parts1 = name1.toLowerCase().split(' ').filter(Boolean);
    const parts2 = name2.toLowerCase().split(' ').filter(Boolean);
    const [shorter, longer] = parts1.length < parts2.length ? [parts1, parts2] : [parts2, parts1];
    return shorter.every(part => longer.includes(part));
}

function normalizeCode(code) {
    return code.replace('A1', 'AI').replace(/-$/, '');
}

function FileUpload({ student }) {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [isCategorizeModalOpen, setIsCategorizeModalOpen] = useState(false);
    const [subjectsToCategorize, setSubjectsToCategorize] = useState([]);
    const [processedSubjects, setProcessedSubjects] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleProcessPDF = async () => {
        if (!file) {
            setMessage("Please select a file.");
            return;
        }
        setProcessing(true);
        setMessage("Analyzing PDF...");

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (event) => {
            try {
                const pdfData = await pdfjsLib.getDocument(event.target.result).promise;
                let fullText = '';
                for (let i = 1; i <= pdfData.numPages; i++) {
                    const page = await pdfData.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ');
                }

                const normalizedText = fullText.replace(/(\w)\s(?=\w)/g, '$1').replace(/\s+/g, ' ');
                const nameRegex = /Student Name\s*:\s*([A-Z\s\.]+?)\s*Reg/i;
                const semesterRegex = /Semester\s*:\s*(.*?)(Program|Gender)/i;
                const pdfNameMatch = normalizedText.match(nameRegex);
                const pdfSemesterMatch = normalizedText.match(semesterRegex);

                if (!pdfNameMatch || !pdfSemesterMatch) {
                    setMessage("❌ Error: Could not read Student Name and Semester from the PDF.");
                    setProcessing(false);
                    return;
                }

                const pdfName = pdfNameMatch[1].trim();
                const pdfSemesterStr = pdfSemesterMatch[1].trim();

                if (!namesMatch(student.profile.name, pdfName)) {
                    setMessage(`❌ Error: PDF name (${pdfName}) does not match profile name (${student.profile.name}).`);
                    setProcessing(false);
                    return;
                }

                const codeToCategoryMap = new Map();
                departmentRules[student.department].categories.forEach(category => {
                    category.subjects.forEach(subject => {
                        codeToCategoryMap.set(normalizeCode(subject.code), category.name);
                    });
                });
                const curriculumCodeMap = new Map(departmentRules[student.department].categories.flatMap(c => c.subjects).map(s => [normalizeCode(s.code), s]));
                
                const extractedSubjects = [];
                const chunks = normalizedText.split('Pass');

                for (const chunk of chunks) {
                    if (chunk.length < 5) continue;
                    const codeMatch = chunk.match(/([A-Z0-9-]{6,})/g);
                    if (!codeMatch) continue;

                    const rawCode = codeMatch[codeMatch.length - 1];
                    const normalizedPdfCode = normalizeCode(rawCode);
                    const parts = chunk.trim().split(/\s+/);
                    if (parts.length < 3) continue;

                    let credits, grade, gradePoint;
                    const lastPart = parts[parts.length - 1];
                    const secondLastPart = parts[parts.length - 2];
                    const thirdLastPart = parts[parts.length - 3];

                    credits = parseInt(lastPart);

                    if (secondLastPart === '+') {
                        grade = thirdLastPart + '+';
                        gradePoint = parseInt(parts[parts.length - 4]);
                    } else if (isNaN(parseInt(secondLastPart))) {
                        grade = secondLastPart;
                        gradePoint = parseInt(thirdLastPart);
                    } else {
                        gradePoint = parseInt(secondLastPart);
                        credits = parseInt(lastPart);
                        const pointsToGradeMap = { 10: 'O', 9: 'A+', 8: 'A', 7: 'B+', 6: 'B', 5: 'C' };
                        grade = pointsToGradeMap[gradePoint] || 'N/A';
                    }

                    if (isNaN(credits) || isNaN(gradePoint)) continue;
                    if (grade === '0' || grade === 'Ο') grade = 'O';

                    let subjectName;
                    let categoryName = codeToCategoryMap.get(normalizedPdfCode) || "Uncategorized";

                    if (curriculumCodeMap.has(normalizedPdfCode)) {
                        subjectName = curriculumCodeMap.get(normalizedPdfCode).name;
                    } else {
                        // --- UPDATED NAME EXTRACTION LOGIC ---
                        const numericPartMatch = chunk.match(/(\s+\d+\s+[A-Z+OΟ]+\s+\d+)$|(\s+\d+\s+\d+)$/);
                        let extractedName = `Unknown Subject (${rawCode})`;
                        if (numericPartMatch) {
                            const namePart = chunk.substring(0, numericPartMatch.index);
                            // Clean the extracted name part
                            let tempName = namePart.replace(rawCode, '');
                            tempName = tempName.replace(/^(ODD|EVEN)\s*/i, '');
                            // Remove common junk characters and extra spaces for a clean name
                            tempName = tempName.replace(/[",-]/g, ' ').replace(/\s+/g, ' ').trim();
                            
                            if (tempName) {
                                extractedName = tempName;
                            }
                        }
                        subjectName = extractedName;
                    }
                    
                    if (!extractedSubjects.some(s => s.code === rawCode)) {
                        extractedSubjects.push({
                            code: rawCode,
                            name: subjectName,
                            credits,
                            grade,
                            gradePoint,
                            category: categoryName,
                            status: 'completed',
                            isFromPDF: true,
                            semester: parseInt(pdfSemesterStr.match(/\d+/)?.[0] || 1),
                        });
                    }
                }

                if (extractedSubjects.length === 0) {
                    setMessage("❌ Could not find any valid subjects in this PDF.");
                    setProcessing(false);
                    return;
                }

                const uncategorized = extractedSubjects.filter(s => s.category === 'Uncategorized');
                const categorized = extractedSubjects.filter(s => s.category !== 'Uncategorized');

                if (uncategorized.length > 0) {
                    setSubjectsToCategorize(uncategorized);
                    setProcessedSubjects(categorized);
                    setIsCategorizeModalOpen(true);
                    setMessage("Action required: Please categorize new subjects.");
                } else {
                    await saveSubjectsToFirestore(extractedSubjects);
                }

            } catch (error) {
                console.error("Error during PDF processing:", error);
                setMessage("❌ Error: Could not process the PDF file.");
            } finally {
                setProcessing(false);
            }
        };
    };

    const saveSubjectsToFirestore = async (finalSubjects) => {
        const subjectMap = new Map(student.enrolledSubjects.map(sub => [sub.name, sub]));
        finalSubjects.forEach(sub => subjectMap.set(sub.name, sub));
        
        const updatedSubjects = Array.from(subjectMap.values());
        const studentDocRef = doc(db, "students", auth.currentUser.uid);
        await updateDoc(studentDocRef, { enrolledSubjects: updatedSubjects });

        setMessage("✅ Success! Dashboard updated.");
    };

    const handleSaveCategories = async (newlyCategorizedSubjects) => {
        const allFinalSubjects = [...processedSubjects, ...newlyCategorizedSubjects];
        await saveSubjectsToFirestore(allFinalSubjects);
        
        setIsCategorizeModalOpen(false);
        setSubjectsToCategorize([]);
        setProcessedSubjects([]);
    };

    return (
        <>
            <div className="card file-upload-card">
                <h4>Process Semester Results from PDF</h4>
                <p>Select a PDF to automatically update your completed subjects.</p>
                <div className="form-group">
                    <input type="file" accept=".pdf" onChange={handleFileChange} disabled={processing} />
                </div>
                <button onClick={handleProcessPDF} disabled={processing || !file}>
                    {processing ? 'Processing...' : 'Process PDF'}
                </button>
                {message && <p className="upload-message">{message}</p>}
            </div>

            {isCategorizeModalOpen && (
                <CategorizeSubjectsModal
                    isOpen={isCategorizeModalOpen}
                    onClose={() => setIsCategorizeModalOpen(false)}
                    onSave={handleSaveCategories}
                    subjects={subjectsToCategorize}
                    categories={departmentRules[student.department]?.categories || []}
                />
            )}
        </>
    );
}

export default FileUpload;
