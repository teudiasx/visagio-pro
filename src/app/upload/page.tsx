'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Camera, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setUploading(true);

    try {
      // Recuperar respostas do quiz
      const quizAnswers = localStorage.getItem('quizAnswers');
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'guest-' + Date.now(),
          imageUrl: selectedImage,
          quizAnswers: quizAnswers ? JSON.parse(quizAnswers) : {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('currentAnalysisId', result.analysisId);
        localStorage.setItem('analysisResult', JSON.stringify(result.analysis));
        localStorage.setItem('userPhoto', selectedImage);
        router.push('/results');
      } else {
        alert('Erro ao processar análise. Tente novamente.');
      }
    } catch (error) {
      alert('Erro ao processar análise.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-[#8A2BE2] via-[#9D4EDD] to-[#8A2BE2] bg-clip-text text-transparent">
            Visagio Pro
          </Link>
        </div>
      </header>

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/quiz" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Quiz
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#8A2BE2] via-[#9D4EDD] to-[#8A2BE2] bg-clip-text text-transparent">
                Envie Sua Foto
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Nossa IA analisará suas características faciais para criar seu plano personalizado
            </p>
          </div>

          <div className="glass-card p-8">
            {!selectedImage ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-[#8A2BE2] rounded-2xl p-12 text-center hover:border-[#9D4EDD] transition-colors">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#8A2BE2] to-[#9D4EDD] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Clique para selecionar</h3>
                  <p className="text-gray-400">ou arraste uma foto aqui</p>
                </div>
              </label>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="w-full py-3 px-6 rounded-xl border border-gray-600 text-center text-gray-300 hover:border-[#8A2BE2] hover:text-white transition-colors">
                      Escolher Outra Foto
                    </div>
                  </label>

                  <button
                    onClick={handleAnalyze}
                    disabled={uploading}
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #8A2BE2 0%, #9D4EDD 100%)',
                      boxShadow: '0 10px 40px rgba(138, 43, 226, 0.5)'
                    }}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analisando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Analisar Foto
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-purple-900/20 border border-purple-500/30">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#8A2BE2]" />
              Dicas para Melhor Resultado
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Use boa iluminação natural ou artificial</li>
              <li>• Tire a foto de frente, com o rosto bem visível</li>
              <li>• Evite filtros ou edições</li>
              <li>• Expressão neutra funciona melhor</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}