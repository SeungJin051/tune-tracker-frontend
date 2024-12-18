'use client';

import ReactMarkdown from 'react-markdown';
import { AiProps } from '../types';
import { useState, useEffect } from 'react';

export default function Ai({ data, predictedUsage }: AiProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [typingText, setTypingText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (analysis) {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < analysis.length) {
          setTypingText(prev => prev + analysis[currentIndex]);
          currentIndex += 1;
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // 50ms마다 한 글자 추가

      return () => clearInterval(typingInterval);
    } else {
      setTypingText('');
    }
  }, [analysis]);

  const handleAiAnalysis = async () => {
    setAnalysis('');
    setTypingText('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, predictedUsage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 분석 요청 실패');
      }

      const result = await response.json();

      console.log('API 응답:', result);

      let cleanedResult = '';
      if (result.analysis) {
        cleanedResult = result.analysis
          .replace(/undefined/g, '')
          .replace(/\\n/g, '\n')
          .trim();

        cleanedResult = cleanedResult.replace(/\s*undefined\s*/g, '');
      }

      setAnalysis(cleanedResult);
    } catch (error: any) {
      console.error('AI 분석 중 오류:', error);
      setErrorMessage(error.message || 'AI 분석 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      <button
        className="px-4 py-2 mb-4 text-sm text-center text-white transition-all border border-transparent rounded-md shadow-md bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
        onClick={handleAiAnalysis}
      >
        AI 분석 실행
      </button>

      {errorMessage && (
        <div className="w-full max-w-lg p-4 mb-4 bg-red-100 rounded-md shadow-md">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {typingText && (
        <div className="w-full max-w-lg p-4 bg-gray-100 rounded-md shadow-md">
          <h5 className="mb-2 text-lg font-semibold text-slate-800">
            AI 분석 결과
          </h5>
          <div className="markdown prose max-w-full">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h2 {...props} />,
                h2: ({ node, ...props }) => <h3 {...props} />,
              }}
              skipHtml={true}
              allowedElements={[
                'p',
                'strong',
                'em',
                'h1',
                'h2',
                'h3',
                'ul',
                'ol',
                'li',
              ]}
            >
              {typingText}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
